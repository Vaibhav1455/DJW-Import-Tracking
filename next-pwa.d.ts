declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: (string | RegExp)[];
  };

  export default function withPWA(
    options: PWAOptions,
  ): (config: NextConfig) => NextConfig;
}
