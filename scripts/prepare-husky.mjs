import { execSync } from 'node:child_process';

if (process.env.CI === 'true' || process.env.HUSKY === '0') {
  process.exit(0);
}

execSync('npx husky', { stdio: 'inherit' });
