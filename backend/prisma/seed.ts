import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { defaultAchievements, defaultExperience, defaultProfile, defaultSkills } from "../src/services/contentDefaults.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "postgresql://portfolio:portfolio_dev_only@localhost:5433/portfolio?schema=public" });
const prisma = new PrismaClient({ adapter });

async function seed() {
  await prisma.profile.upsert({ where: { id: defaultProfile.id }, create: defaultProfile, update: defaultProfile });
  for (const [index, item] of defaultAchievements.entries()) {
    const id = `seed-achievement-${index + 1}`;
    await prisma.achievement.upsert({ where: { id }, create: { id, ...item }, update: item });
  }
  for (const [index, item] of defaultExperience.entries()) {
    const id = `seed-experience-${index + 1}`;
    await prisma.experience.upsert({ where: { id }, create: { id, ...item }, update: item });
  }
  for (const item of defaultSkills) {
    await prisma.skill.upsert({ where: { name: item.name }, create: item, update: item });
  }
}

seed().then(() => console.info("Portfolio backend seed complete")).catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
