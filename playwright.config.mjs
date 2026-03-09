import { defineConfig } from "@playwright/test";

const clientRoot = "/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    viewport: { width: 1440, height: 960 },
    launchOptions: {
      args: [
        "--use-angle=swiftshader",
        "--use-gl=angle",
        "--ignore-gpu-blocklist",
        "--enable-webgl",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1",
    cwd: clientRoot,
    reuseExistingServer: true,
    timeout: 10000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
