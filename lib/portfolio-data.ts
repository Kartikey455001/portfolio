export type SkillGroup = "Languages" | "Web Dev" | "AI & Tools" | "Core CS";

export type Skill = {
  name: string;
  group: SkillGroup;
  mark: string;
  tone: "cyan" | "white" | "yellow" | "blue" | "green" | "orange" | "purple";
  proficiency?: string;
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  tags: string[];
  mark: string;
  image: string;
  kind: "ai-nutrition" | "conversational-ai" | "fullstack";
  featured?: boolean;
  repositoryUrl: string;
  demoUrl?: string;
  language?: string;
  stars?: number;
  forks?: number;
  topics?: string[];
  updatedAt?: string;
};

export type Achievement = {
  mark: string;
  title: string;
  detail: string;
  metric: string;
  years: string;
  tag: string;
};

export type Certificate = {
  title: string;
  issuer: string;
  year: string;
  link: string;
  credentialId?: string;
  badge: string;
};

export type Education = {
  degree: string;
  institution: string;
  location: string;
  period: string;
  score?: string;
  highlights: string[];
};

export type Responsibility = {
  role: string;
  organization: string;
  period: string;
  bullets: string[];
};

export const personalInfo = {
  name: "Kartikey Upadhyay",
  title: "BCA (AI & ML) Undergraduate · Full-Stack Developer",
  tagline: "Building intelligent web products, mastering algorithms, and creating AI-driven solutions.",
  objective:
    "BCA (AI & ML) undergraduate with strong foundations in Data Structures & Algorithms, Core Computer Science, and Full-Stack Web Development. Proficient in JavaScript, React.js, Node.js, and SQL, with a passion for solving real-world problems through technology.",
  phone: "+91 7389843954",
  email: "kartikeyupadhyay450@gmail.com",
  github: "https://github.com/Kartikey455001",
  githubDisplay: "Kartikey455001",
  linkedin: "https://linkedin.com/in/kartikey2006/",
  linkedinDisplay: "kartikey2006",
  location: "Jaipur, Rajasthan, India",
  university: "JECRC University, Jaipur",
  cgpa: "8.03",
  resumeUrl: "/kartikey-upadhyay-resume.pdf",
};

export const skills: Skill[] = [
  // Programming Languages
  { name: "C++", group: "Languages", mark: "C++", tone: "blue", proficiency: "DSA & Problem Solving" },
  { name: "JavaScript", group: "Languages", mark: "JS", tone: "yellow", proficiency: "ES6+, Async, DOM" },
  { name: "Python", group: "Languages", mark: "Py", tone: "yellow", proficiency: "AI Scripts & Automation" },
  { name: "SQL", group: "Languages", mark: "SQL", tone: "blue", proficiency: "Relational Queries & Joins" },

  // Web Development
  { name: "React.js", group: "Web Dev", mark: "⚛", tone: "cyan", proficiency: "Hooks, SPA, Component UI" },
  { name: "Next.js", group: "Web Dev", mark: "N", tone: "white", proficiency: "App Router, SSR, Server Actions" },
  { name: "Node.js", group: "Web Dev", mark: "⬡", tone: "green", proficiency: "Event Loop, REST APIs, Microservices" },
  { name: "Express.js", group: "Web Dev", mark: "Ex", tone: "white", proficiency: "Routing, Middleware, Auth" },
  { name: "MongoDB", group: "Web Dev", mark: "🍃", tone: "green", proficiency: "NoSQL, Mongoose, Aggregations" },
  { name: "REST APIs", group: "Web Dev", mark: "⚡", tone: "orange", proficiency: "API Design & Integration" },
  { name: "HTML5", group: "Web Dev", mark: "5", tone: "orange", proficiency: "Semantic Markup, Accessibility" },
  { name: "CSS3", group: "Web Dev", mark: "3", tone: "blue", proficiency: "Flexbox, Grid, Animations" },

  // AI Platforms & Tools
  { name: "Google AI Studio", group: "AI & Tools", mark: "✦", tone: "cyan", proficiency: "Prompt Design & Tuning" },
  { name: "Google Gemini API", group: "AI & Tools", mark: "✨", tone: "purple", proficiency: "Multimodal AI & Agents" },
  { name: "Claude", group: "AI & Tools", mark: "✳", tone: "orange", proficiency: "Advanced LLM Workflows" },
  { name: "Git", group: "AI & Tools", mark: "◆", tone: "orange", proficiency: "Branching, PRs, Versioning" },
  { name: "GitHub", group: "AI & Tools", mark: "⌘", tone: "white", proficiency: "CI/CD & Open Source" },
  { name: "Docker", group: "AI & Tools", mark: "🐳", tone: "cyan", proficiency: "Containerization & Deployment" },

  // Core Computer Science
  { name: "Data Structures & Algorithms", group: "Core CS", mark: "{ }", tone: "purple", proficiency: "LeetCode 100+ Solved" },
  { name: "OOP (Object-Oriented Programming)", group: "Core CS", mark: "◈", tone: "blue", proficiency: "Classes, Polymorphism, Design" },
  { name: "DBMS", group: "Core CS", mark: "◉", tone: "green", proficiency: "Normalization, ACID, Indexing" },
  { name: "Operating Systems", group: "Core CS", mark: "⚙", tone: "cyan", proficiency: "Processes, Memory, Concurrency" },
  { name: "Computer Networks", group: "Core CS", mark: "🌐", tone: "blue", proficiency: "TCP/IP, HTTP/S, Sockets" },
  { name: "SDLC", group: "Core CS", mark: "🔄", tone: "orange", proficiency: "Agile, Code Review, Testing" },
];

export const demoProjects: Project[] = [
  {
    id: "nutrizen",
    name: "NutriZen",
    tagline: "AI-Powered Smart Nutrition Assistant & Barcode Analyzer",
    description:
      "An intelligent nutrition assistant that analyzes packaged food products by scanning barcodes, retrieves live product data from Open Food Facts, and generates instant health insights and ingredient breakdowns using Google Gemini AI.",
    bullets: [
      "Built an AI-powered nutrition assistant that analyzes packaged food products by scanning barcodes, retrieves product details from Open Food Facts, and generates health insights using Google Gemini AI.",
      "Developed a robust MERN backend with MongoDB caching to store product data and AI analysis, reducing repeated API calls while providing health scores, ingredient analysis, nutrition breakdown, and healthier product recommendations.",
      "Engineered real-time additive and preservative hazard warnings, personalized dietary alerts, and calorie breakdown dashboards.",
    ],
    tags: ["React", "Node.js", "Express.js", "MongoDB", "Google Gemini API", "Open Food Facts"],
    mark: "🥗",
    image: "/images/nutrizen-preview.jpg",
    kind: "ai-nutrition",
    featured: true,
    repositoryUrl: "https://github.com/Kartikey455001/NutriZen",
    demoUrl: "https://nutrizen.kartikeyprojects.in/",
    language: "JavaScript / React",
    stars: 14,
    forks: 3,
    topics: ["gemini-ai", "mern-stack", "nutrition-analysis", "barcode-scanner", "mongodb-caching"],
    updatedAt: "Active Project",
  },
  {
    id: "mygpt",
    name: "MYGPT",
    tagline: "Full-Stack Conversational AI Interface with Google Gemini",
    description:
      "A fast, responsive full-stack conversational AI interface leveraging the Google Gemini API to process queries, render markdown with syntax-highlighted code snippets, and deliver context-aware natural language responses.",
    bullets: [
      "Designed and developed a full-stack conversational AI interface leveraging the Google Gemini API to process and generate fast, highly accurate, context-aware natural language responses.",
      "Implemented a clean obsidian & neon dark mode interface with token-efficient prompt workflows, conversation threads, and instant copy/action buttons.",
      "Built resilient backend middleware handling API rate-limiting, error fallbacks, and multi-turn conversational context preservation.",
    ],
    tags: ["React.js", "Node.js", "Express.js", "Google Gemini API", "Tailwind CSS", "REST APIs"],
    mark: "🤖",
    image: "/images/mygpt-preview.jpg",
    kind: "conversational-ai",
    featured: false,
    repositoryUrl: "https://github.com/Kartikey455001/MYGPT",
    demoUrl: "https://mygpt.kartikeyprojects.in/",
    language: "JavaScript / Node.js",
    stars: 11,
    forks: 2,
    topics: ["gemini-api", "conversational-ai", "react", "express", "generative-ai"],
    updatedAt: "Active Project",
  },
];

export const achievements: Achievement[] = [
  {
    mark: "🏆",
    title: "Smart India Hackathon (SIH) 2026 Prelims — Top 20",
    detail: "Secured Top 20 position among hundreds of participating teams in SIH 2026 Prelims, presenting innovative real-world software solutions.",
    metric: "Top 20 Teams",
    years: "2026",
    tag: "National Hackathon",
  },
  {
    mark: "⚡",
    title: "100+ Data Structures & Algorithms Solved",
    detail: "Consistent problem solver on LeetCode focusing on arrays, two-pointer techniques, trees, dynamic programming, and recursion in C++.",
    metric: "100+ Solved",
    years: "2024 – Present",
    tag: "Problem Solving",
  },
  {
    mark: "🎓",
    title: "Academic Excellence — CGPA 8.03",
    detail: "Maintaining strong academic performance in BCA (AI & ML) at JECRC University, balancing coursework with active full-stack and AI project development.",
    metric: "8.03 CGPA",
    years: "2024 – 2027",
    tag: "Academics",
  },
];

export const certificates: Certificate[] = [
  {
    title: "Advanced Prompt Engineering",
    issuer: "upGrad",
    year: "2025",
    link: "https://certificates.upgrad.com/454d8d4c-8e07-4001-84e2-a1a3d290aaa3-Free%20Course%20Completion-r0q316tNtcXDjBjv.jpeg",
    badge: "GenAI Specialist",
  },
];

export const educationList: Education[] = [
  {
    degree: "Bachelor of Computer Applications (AI & ML)",
    institution: "JECRC University",
    location: "Jaipur, Rajasthan",
    period: "2024 – 2027",
    score: "CGPA: 8.03",
    highlights: [
      "Specialization in Artificial Intelligence and Machine Learning",
      "Core courses: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, OOP",
      "Active participant in tech hackathons and developer events",
    ],
  },
  {
    degree: "Senior Secondary (CBSE - Class XII)",
    institution: "Vandana Convent School",
    location: "Guna, Madhya Pradesh",
    period: "2024",
    highlights: [
      "Completed Senior Secondary Education under CBSE curriculum",
      "Solid foundation in Mathematics, Sciences, and Computer Science fundamentals",
    ],
  },
];

export const responsibilities: Responsibility[] = [
  {
    role: "Class Representative (CR)",
    organization: "JECRC University, Jaipur",
    period: "2024 – Present",
    bullets: [
      "Represented the class as the primary liaison between students and faculty, ensuring effective communication of academic updates and announcements.",
      "Coordinated classroom activities, laboratory sessions, and assisted in addressing student concerns, demonstrating leadership, teamwork, and organizational skills.",
      "Bridged student feedback to department heads for curriculum activities and technical workshops.",
    ],
  },
];

export const contactLinks = [
  {
    label: "Email",
    value: "kartikeyupadhyay450@gmail.com",
    href: "mailto:kartikeyupadhyay450@gmail.com",
    subtext: "Personal & Professional Inquiries",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/kartikey2006",
    href: "https://linkedin.com/in/kartikey2006/",
    subtext: "Connect & Network",
  },
  {
    label: "GitHub",
    value: "github.com/Kartikey455001",
    href: "https://github.com/Kartikey455001",
    subtext: "Code Repositories & Demos",
  },
  {
    label: "Phone",
    value: "+91 7389843954",
    href: "tel:+917389843954",
    subtext: "Direct Contact (Call / WhatsApp)",
  },
];

