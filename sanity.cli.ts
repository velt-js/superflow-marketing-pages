import { defineCliConfig } from "sanity/cli";
import { projectId, dataset } from "./sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "superflow",
  deployment: {
    appId: "st9qtv2z06j3fjxyjoiwyyd0",
  },
});
