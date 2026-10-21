import { spawnSync } from 'node:child_process';
import process from 'node:process';
const tasks = ['lint', 'typecheck', 'test', 'validate:content', 'build:github'];
for (const task of tasks) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', task], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      VITE_SITE_URL: process.env.VITE_SITE_URL || 'https://089-dusitt.github.io/starlit-tarot',
      VITE_BASE_PATH: process.env.VITE_BASE_PATH || '/starlit-tarot/',
    },
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
