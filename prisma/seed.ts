/* eslint-disable no-console */
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

async function main() {
  // Basic seed: one user, a couple projects
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const user = await db.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      passwordHash,
    },
    create: {
      email: "demo@example.com",
      name: "Demo User",
      role: "OWNER",
      passwordHash,
    },
  });

  const projectA = await db.project.create({
    data: { name: "House Renovation", address: "123 Main St" },
  });

  const projectB = await db.project.create({ data: { name: "Garage Build" } });

  console.log("Seeded:", { user: user.email, projects: [projectA.name, projectB.name] });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


