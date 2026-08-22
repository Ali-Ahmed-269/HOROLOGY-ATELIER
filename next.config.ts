import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WORKAROUND: Disabled due to @react-three/postprocessing@3.0.5 bug
  // where EffectComposer crashes on StrictMode double-invoke.
  // Re-enable when pmndrs/react-postprocessing issue is resolved.
  // Tracking: https://github.com/pmndrs/react-postprocessing/issues
  reactStrictMode: false,
};

export default nextConfig;
