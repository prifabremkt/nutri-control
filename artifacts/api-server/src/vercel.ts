import app from "./app";
import { seedDatabase } from "./seed";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

ensureSeeded().catch(console.error);

export default app;
