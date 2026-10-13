export const defaultProfile = {
  id: "main", name: "Kartikey Upadhyay", headline: "Full Stack Developer | AI Enthusiast | Problem Solver",
  bio: "BCA (AI & ML) student at JECRC University, Jaipur. Passionate about Full Stack Development, AI and solving real world problems through technology. I enjoy turning ideas into products and constantly learning new things.",
  location: "Jaipur, India", email: "kartikeyupadhyay@example.com", resumeUrl: null,
  githubUsername: "kartikeyupadhyay", leetcodeUsername: "", linkedinProfileUrl: "https://www.linkedin.com/in/kartikey-upadhyay/",
};

export const defaultAchievements = [
  { title: "SIH 2026 — Top 5", description: "ISRO Problem Statement (ASTRA)", organization: "Smart India Hackathon", year: "2026", icon: "medal", displayOrder: 0 },
  { title: "100+ LeetCode Problems", description: "Consistent problem solving", organization: "LeetCode", year: "2024–2026", icon: "code", displayOrder: 1 },
  { title: "IBM ThinkFest 2026", description: "Smart Campus Parking System", organization: "IBM", year: "2026", icon: "star", displayOrder: 2 },
  { title: "Smart India Hackathon 2024, 2025", description: "Participated", organization: "Smart India Hackathon", year: "2024, 2025", icon: "shield", displayOrder: 3 },
  { title: "Various Certifications", description: "Prompt Engineering, NPTEL, etc.", organization: null, year: "2024–2026", icon: "certificate", displayOrder: 4 },
];

export const defaultExperience = [
  { company: "InvoLink", role: "SDE Intern", description: null, startDate: new Date("2027-01-01T00:00:00.000Z"), endDate: null, location: null, employmentType: "Internship", technologies: [], displayOrder: 0 },
  { company: "Vitraga Solutions", role: "Software Engineer Intern", description: null, startDate: new Date("2026-01-01T00:00:00.000Z"), endDate: null, location: null, employmentType: "Internship", technologies: [], displayOrder: 1 },
  { company: "Jalan Technologies", role: "Full Stack Intern", description: null, startDate: new Date("2026-01-01T00:00:00.000Z"), endDate: null, location: null, employmentType: "Internship", technologies: [], displayOrder: 2 },
  { company: "JECRC University, Jaipur", role: "Student", description: "BCA (AI & ML)", startDate: new Date("2024-01-01T00:00:00.000Z"), endDate: new Date("2027-12-31T00:00:00.000Z"), location: "Jaipur, India", employmentType: "Education", technologies: [], displayOrder: 3 },
];

export const defaultSkills = [
  ["React", "Frontend", "⚛"], ["Next.js", "Frontend", "N"], ["JavaScript", "Frontend", "JS"], ["TypeScript", "Frontend", "TS"],
  ["Node.js", "Backend", "⬡"], ["Express.js", "Backend", "Ex"], ["MongoDB", "Database", "◈"], ["PostgreSQL", "Database", "◉"],
  ["Prisma", "Database", "◇"], ["HTML", "Frontend", "5"], ["CSS", "Frontend", "5"], ["Tailwind CSS", "Frontend", "≈"],
  ["Python", "AI/ML", "Py"], ["Java", "Backend", "♨"], ["C++", "Tools", "C++"], ["Git", "Tools", "◆"], ["Docker", "Tools", "◉"], ["VS Code", "Tools", "⌘"],
].map(([name, category, icon], displayOrder) => ({ name: name!, category: category!, icon: icon!, displayOrder }));

