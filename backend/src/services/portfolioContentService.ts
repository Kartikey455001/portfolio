import { prisma } from "../config/prisma.js";
import { defaultAchievements, defaultExperience, defaultProfile, defaultSkills } from "./contentDefaults.js";

export async function getProfile() {
  const profile = await prisma.profile.findUnique({ where: { id: "main" } });
  return { data: profile ?? defaultProfile, dataSource: profile ? "cache" : "mock" };
}

export async function getAchievements() {
  const rows = await prisma.achievement.findMany({ where: { isPublished: true }, orderBy: { displayOrder: "asc" } });
  return { data: rows.length ? rows : defaultAchievements, dataSource: rows.length ? "cache" : "mock" };
}

export async function getExperience() {
  const rows = await prisma.experience.findMany({ where: { isPublished: true }, orderBy: { displayOrder: "asc" } });
  const data = rows.length ? rows : defaultExperience;
  return { data: data.map((item) => ({ ...item, period: "period" in item ? item.period : item.endDate ? `${item.startDate?.getUTCFullYear()}–${item.endDate.getUTCFullYear()}` : item.startDate?.getUTCFullYear() === 2027 ? "Jan 2027" : String(item.startDate?.getUTCFullYear() ?? ""), note: item.startDate?.getUTCFullYear() === 2027 ? "Upcoming" : undefined })), dataSource: rows.length ? "cache" : "mock" };
}

export async function getSkills() {
  const rows = await prisma.skill.findMany({ where: { isPublished: true }, orderBy: { displayOrder: "asc" } });
  return { data: rows.length ? rows : defaultSkills, dataSource: rows.length ? "cache" : "mock" };
}

