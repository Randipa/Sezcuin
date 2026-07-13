import { api } from "./api";

export const web = new sst.aws.Nextjs("Web", {
  path: "frontend",
  environment: {
    NEXT_PUBLIC_API_URL: $interpolate`${api.url}/api`,
  },
});
