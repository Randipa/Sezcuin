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
    const { api } = await import("./infra/api");
    const { seed } = await import("./infra/seed");

    return {
      api: api.url,
      database: postgres.host,
      seed: seed.name,
    };
  },
});
