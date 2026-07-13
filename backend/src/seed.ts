import { runSeed } from './seed-runner';

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});

async function seed() {
  await runSeed();
}
