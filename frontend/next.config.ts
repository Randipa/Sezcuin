import path from 'node:path';
import type { NextConfig } from 'next';

const monorepoRoot = path.join(__dirname, '..');

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  serverExternalPackages: ['axios'],
};

export default nextConfig;
