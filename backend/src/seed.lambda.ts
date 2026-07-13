import 'reflect-metadata';

import { runSeed } from './seed-runner';

export const handler = async () => {
  await runSeed();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Seed completed successfully' }),
  };
};
