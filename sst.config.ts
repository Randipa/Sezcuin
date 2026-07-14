/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sezcuin",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const { postgres } = await import("./infra/database");
    const { email } = await import("./infra/email");
    const { api, attachApiRoutes } = await import("./infra/api");
    const { web } = await import("./infra/web");
    const { seed } = await import("./infra/seed");

    attachApiRoutes(web.url);

    return {
      api: api.url,
      web: web.url,
      database: postgres.host,
      email: email.sender,
      seed: seed.name,
    };
  },
});
