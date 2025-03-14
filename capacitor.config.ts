import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "net.davidstrasak.conveyorcontroller",
  appName: "Conveyor Controller",
  webDir: "dist",

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
