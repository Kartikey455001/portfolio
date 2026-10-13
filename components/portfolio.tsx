"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  Flame,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Send,
  Sparkles,
  Sun,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  achievements,
  certificates,
  contactLinks,
  demoProjects,
  educationList,
  personalInfo,
  responsibilities,
  skills,
  type Project,
  type SkillGroup,
} from "@/lib/portfolio-data";
import { loadProjects, loadReadme } from "@/lib/services/github-service";
import { LEETCODE_PROFILE_URL, loadLeetCodeStats, type LeetCodeStats } from "@/lib/services/leetcode-service";

function Github({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function Linkedin({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Skills", id: "skills" },
  { label: "Projects", id: "projects" },
  { label: "LeetCode", id: "leetcode" },
  { label: "Achievements", id: "achievements" },
  { label: "Journey", id: "journey" },
  { label: "Contact", id: "contact" },
];

type RevealProps = { children: ReactNode; className?: string; delay?: number };

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const range = document.documentElement.scrollHeight - window.innerHeight;
        const progress = range > 0 ? window.scrollY / range : 0;
        node.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [number, setNumber] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    let startedAt = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const tick = (time: number) => {
          if (!startedAt) startedAt = time;
          const progress = Math.min((time - startedAt) / 850, 1);
          setNumber(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.05 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref}>
      {number}
      {suffix}
    </span>
  );
}

function SectionHeading({
  number,
  title,
  subtitle,
  action,
}: {
  number: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div className="section-heading-copy">
        <span className="section-number">{number}</span>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
}

function Hero({ onResumePreview, leetcodeTotal }: { onResumePreview: () => void; leetcodeTotal: number }) {
  const [imageReady, setImageReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImageReady(true);
    image.src = "/images/kartikey-portrait.jpg";
  }, []);

  return (
    <section ref={heroRef} className="hero" id="home" aria-label="Introduction">
      <div className="hero-grid-ambient" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-badge">
          <span className="pulse-dot" />
          <span>Available for SDE &amp; AI Internships</span>
        </div>

        <p className="hero-intro">Hey, I&apos;m</p>
        <h1>
          Kartikey<br />
          <span className="text-gradient">Upadhyay</span>
        </h1>

        <div className="hero-pills">
          <span className="hero-pill primary">
            <Sparkles size={13} /> BCA (AI &amp; ML) @ JECRC
          </span>
          <span className="hero-pill">
            <Code2 size={13} /> Full-Stack MERN
          </span>
          <span className="hero-pill">
            <BarChart3 size={13} /> {leetcodeTotal}+ LeetCode DSA
          </span>
        </div>

        <p className="hero-summary">
          BCA (AI &amp; ML) undergraduate with strong foundations in Data Structures &amp; Algorithms, Core Computer
          Science, and Full-Stack Web Development. Proficient in JavaScript, React.js, Node.js, and SQL, with a passion for
          solving real-world problems through technology.
        </p>

        <div className="hero-actions">
          <a className="button-primary" href="#projects">
            Explore Projects <ArrowDown size={15} />
          </a>
          <button className="button-accent" onClick={onResumePreview}>
            <Eye size={15} /> View Resume
          </button>
          <a
            className="button-outline"
            href={personalInfo.resumeUrl}
            download="Kartikey_Upadhyay_Resume.pdf"
            title="Download PDF"
          >
            <Download size={14} /> PDF
          </a>
        </div>

        <div className="hero-stats" aria-label="Key accomplishments">
          <div className="stat-box">
            <strong>150+</strong>
            <span>LeetCode Solved</span>
          </div>
          <div className="stat-box">
            <strong>Top 20</strong>
            <span>SIH 2026 Prelims</span>
          </div>
          <div className="stat-box">
            <strong>8.03</strong>
            <span>CGPA @ JECRC</span>
          </div>
          <div className="stat-box">
            <strong>2 Flagship</strong>
            <span>AI Web Apps</span>
          </div>
        </div>
      </div>

      {/* Expanded Cinematic AI Developer Visual with Left Half-Transparency Fade */}
      <div className={`hero-expanded-art ${imageReady ? "art-ready" : ""}`} aria-hidden="true">
        <img
          src="/images/kartikey-portrait.jpg"
          alt="Kartikey Upadhyay - AI & Full Stack Developer"
          className="hero-art-img"
        />
        <div className="hero-expanded-shade" />
      </div>



      <a className="scroll-cue" href="#about">
        <span>
          <ArrowDown size={14} />
        </span>
        Scroll to explore
      </a>
    </section>
  );
}

function About({ onResumePreview }: { onResumePreview: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="section about-section" id="about">
      <Reveal>
        <SectionHeading
          number="02"
          title="About Me"
          subtitle="Foundations in Computer Science, Passion for Intelligent Systems"
        />
        <div className="about-grid">
          <div className="about-copy">
            <div className="about-intro">
              <span className="about-kicker"><Sparkles size={13} /> THE PERSON BEHIND THE CODE</span>
              <h3>I turn ideas into <span className="text-gradient">useful software.</span></h3>
            </div>
            <p>
              I&apos;m an undergraduate pursuing <strong>Bachelor of Computer Applications (AI &amp; ML)</strong> at{" "}
              <strong>JECRC University, Jaipur</strong> (2024 – 2027) with an academic score of <strong>8.03 CGPA</strong>.
              I completed my Senior Secondary education (CBSE) at <strong>Vandana Convent School, Guna (Madhya Pradesh)</strong>.
            </p>
            <p>
              My expertise bridges <strong>Data Structures &amp; Algorithms</strong>, <strong>Object-Oriented Programming</strong>,{" "}
              <strong>DBMS</strong>, <strong>Operating Systems</strong>, and <strong>Computer Networks</strong> with modern
              full-stack web development. I actively build with <strong>React.js, Next.js, Node.js, Express.js, MongoDB, and SQL</strong>,
              combining them with cutting-edge AI via the <strong>Google Gemini API</strong> and <strong>Google AI Studio</strong>.
            </p>
            <p>
              Beyond coding, I serve as the <strong>Class Representative (CR)</strong> at JECRC University, coordinating between
              faculty and students, organizing technical sessions, and fostering collaborative learning.
            </p>

            <div className="about-facts">
              <span>
                <MapPin size={13} /> {personalInfo.location}
              </span>
              <span>
                <GraduationCap size={14} /> JECRC University (CGPA: {personalInfo.cgpa})
              </span>
              <span>
                <Award size={13} /> Vandana Convent School, Guna
              </span>
              <span>
                <Users size={13} /> Class Representative (CR)
              </span>
              <span>
                <BriefcaseBusiness size={13} /> Open to Internships
              </span>
            </div>

            <div className="about-ctas">
              <button className="button-primary resume-download" onClick={onResumePreview}>
                <Eye size={14} /> View Resume (PDF)
              </button>
              <a
                className="button-outline"
                href={personalInfo.resumeUrl}
                download="Kartikey_Upadhyay_Resume.pdf"
              >
                <Download size={14} /> Download PDF
              </a>
              <button className="button-outline copy-email-btn" onClick={copyEmail} title="Copy email address">
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                {copied ? "Email Copied!" : "Copy Email"}
              </button>
            </div>
          </div>

          <div className="code-window" aria-label="Developer summary code snippet">
            <div className="window-dots">
              <i />
              <i />
              <i />
              <span className="window-title">kartikey.config.ts</span>
            </div>
            <code>
              <span className="code-keyword">const</span> developer: <span className="code-type">DeveloperProfile</span> = &#123;<br />
              &nbsp;&nbsp;name: <span className="code-string">&quot;{personalInfo.name}&quot;</span>,<br />
              &nbsp;&nbsp;degree: <span className="code-string">&quot;BCA (AI &amp; ML)&quot;</span>,<br />
              &nbsp;&nbsp;university: <span className="code-string">&quot;JECRC University&quot;</span>,<br />
              &nbsp;&nbsp;cgpa: <span className="code-number">8.03</span>,<br />
              &nbsp;&nbsp;coreSkills: [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-string">&quot;DSA (C++)&quot;</span>, <span className="code-string">&quot;React.js&quot;</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-string">&quot;Node.js&quot;</span>, <span className="code-string">&quot;MongoDB&quot;</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-string">&quot;Google Gemini AI&quot;</span><br />
              &nbsp;&nbsp;],<br />
              &nbsp;&nbsp;projects: [<span className="code-string">&quot;NutriZen&quot;</span>, <span className="code-string">&quot;MYGPT&quot;</span>],<br />
              &nbsp;&nbsp;motto: <span className="code-string">&quot;Turn real problems into clear solutions.&quot;</span><br />
              &#125;;
            </code>
            <div className="code-window-tag">
              <Sparkles size={12} /> GenAI + FullStack
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const skillFilters: Array<"All" | SkillGroup> = ["All", "Languages", "Web Dev", "AI & Tools", "Core CS"];

function Skills() {
  const [filter, setFilter] = useState<(typeof skillFilters)[number]>("All");
  const visibleSkills = useMemo(
    () => (filter === "All" ? skills : skills.filter((skill) => skill.group === filter)),
    [filter]
  );

  return (
    <section className="section skills-section" id="skills">
      <Reveal>
        <SectionHeading
          number="03"
          title="Technical Skills"
          subtitle="Curated from academic rigor, competitive problem solving, and modern web & AI engineering"
        />
        <div className="skill-filters" role="tablist" aria-label="Filter skills">
          {skillFilters.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={filter === item}
              className={filter === item ? "filter-chip active" : "filter-chip"}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="skills-grid">
          {visibleSkills.map((skill, index) => (
            <Reveal key={skill.name} delay={(index % 6) * 35}>
              <article
                className="skill-card"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty(
                    "--tilt-x",
                    `${((event.clientY - rect.top) / rect.height - 0.5) * -6}deg`
                  );
                  event.currentTarget.style.setProperty(
                    "--tilt-y",
                    `${((event.clientX - rect.left) / rect.width - 0.5) * 8}deg`
                  );
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.setProperty("--tilt-x", "0deg");
                  event.currentTarget.style.setProperty("--tilt-y", "0deg");
                }}
              >
                <div className="skill-card-top">
                  <span className={`skill-mark ${skill.tone}`}>{skill.mark}</span>
                  <span className="skill-group-tag">{skill.group}</span>
                </div>
                <strong className="skill-name">{skill.name}</strong>
                {skill.proficiency && <span className="skill-proficiency">{skill.proficiency}</span>}
              </article>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function ProjectCard({
  project,
  onOpen,
  featured = false,
}: {
  project: Project;
  onOpen: (project: Project) => void;
  featured?: boolean;
}) {
  return (
    <article className={featured ? "project-card featured-project" : "project-card standard-project"}>
      <div className="project-image-container">
        <img src={project.image} alt={project.name} className="project-thumb-img" loading="lazy" />
        <div className="project-image-gradient" />
        <span className="project-kind-badge">
          {project.kind === "ai-nutrition" ? "🥗 AI Health Assistant" : "🤖 Conversational AI"}
        </span>
        <button
          className="project-inspect-button"
          onClick={() => onOpen(project)}
          aria-label={`Inspect ${project.name}`}
        >
          <Eye size={16} /> Preview Details
        </button>
      </div>

      <div className="project-copy">
        <div className="project-header-row">
          <div>
            <span className="project-eyebrow">{featured ? "FEATURED MERN + AI" : "FULL-STACK GEMINI APP"}</span>
            <h3>{project.name}</h3>
          </div>
          <span className="project-emoji-mark">{project.mark}</span>
        </div>

        <p className="project-tagline">{project.tagline}</p>
        <p className="project-description">{project.description}</p>

        <ul className="project-bullets">
          {project.bullets.map((bullet, idx) => (
            <li key={idx}>
              <span className="bullet-dot">▹</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="project-actions">
          <button className="button-primary small-button" onClick={() => onOpen(project)}>
            View Case Study <ArrowRight size={13} />
          </button>
          {project.demoUrl && (
            <a className="button-accent small-button" href={project.demoUrl} target="_blank" rel="noreferrer">
              Live Demo <ExternalLink size={13} />
            </a>
          )}
          <a
            className="button-outline small-button"
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            title="View code on GitHub"
          >
            <Github size={14} /> GitHub
          </a>
        </div>
      </div>
    </article>
  );
}

function Projects({
  projects,
  loading,
  error,
  onOpen,
}: {
  projects: Project[];
  loading: boolean;
  error: boolean;
  onOpen: (project: Project) => void;
}) {
  const displayProjects = projects.length > 0 ? projects : demoProjects;
  const nutriZen = displayProjects.find((p) => p.id === "nutrizen") || displayProjects[0];
  const myGpt = displayProjects.find((p) => p.id === "mygpt") || displayProjects[1] || displayProjects[0];

  return (
    <section className="section projects-section" id="projects">
      <Reveal>
        <SectionHeading
          number="04"
          title="Flagship Projects"
          subtitle="Real-world, full-stack applications with AI integration detailed in the resume"
          action={
            <a
              className="text-link"
              href="https://github.com/Kartikey455001?tab=repositories"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repositories <ArrowRight size={13} />
            </a>
          }
        />

        {loading ? (
          <div className="project-skeleton" aria-label="Loading projects">
            <i />
            <i />
          </div>
        ) : error ? (
          <p className="inline-state">Projects are temporarily unavailable. Please check back soon.</p>
        ) : (
          <div className="projects-showcase">
            <ProjectCard project={nutriZen} featured onOpen={onOpen} />
            <div className="projects-secondary-row">
              <ProjectCard project={myGpt} onOpen={onOpen} />
              <div className="project-github-spotlight">
                <div className="gh-icon-box">
                  <Github size={28} />
                </div>
                <h4>Explore More on GitHub</h4>
                <p>
                  Check out repositories, code commits, algorithmic problem sets, and web development experiments on my
                  public GitHub profile.
                </p>
                <div className="gh-tags">
                  <span>github.com/Kartikey455001</span>
                </div>
                <a
                  className="button-primary small-button gh-visit-btn"
                  href="https://github.com/Kartikey455001"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit GitHub Profile <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function LeetCode({ stats }: { stats: LeetCodeStats }) {
  const weekCount = Math.floor(stats.activity.length / 7);
  const activityLevel = (count: number) => count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
  const monthLabels = Array.from({ length: 6 }, (_, index) => {
    const weekIndex = Math.floor((index * Math.max(weekCount - 1, 0)) / 5);
    const date = stats.activity[weekIndex * 7]?.date;
    return date ? new Date(`${date}T00:00:00Z`).toLocaleDateString("en", { month: "short", timeZone: "UTC" }) : "";
  });
  return (
    <section className="section leetcode-section" id="leetcode">
      <Reveal>
        <SectionHeading
          number="05"
          title="LeetCode & Problem Solving"
          subtitle="Live problem-solving stats and activity from my LeetCode profile"
          action={
            <a className="text-link" href={LEETCODE_PROFILE_URL} target="_blank" rel="noreferrer">
              LeetCode Profile <ArrowRight size={13} />
            </a>
          }
        />
        <div className="leetcode-panel">
          <div className="leetcode-overview">
            <div className="total-solved">
              <span className="leetcode-mark">◈</span>
              <div>
                <strong>{stats.total}</strong>
                <small>DSA Problems Solved</small>
              </div>
            </div>
            <div className="difficulty-list">
              {[
                ["Easy", stats.easy, "easy"],
                ["Medium", stats.medium, "medium"],
                ["Hard", stats.hard, "hard"],
              ].map(([label, value, tone]) => (
                <div className="difficulty-row" key={label}>
                  <i className={`difficulty-dot ${tone}`} />
                  <b>{value}</b>
                  <span>{label}</span>
                  <ChevronRight size={12} />
                </div>
              ))}
            </div>
          </div>

          <div className="activity-calendar" role="group" aria-label="LeetCode submission activity, last 34 weeks">
            <div className="activity-header">
              <span>Submission Activity</span>
              <span className="activity-year">{stats.currentStreak}-day streak</span>
            </div>
            <div className="activity-months">
              {monthLabels.map((month, index) => <span key={`${month}-${index}`}>{month}</span>)}
            </div>
            <div className="heatmap-grid">
              {stats.activity.slice(0, weekCount * 7).map(({ date, count }) => (
                <i
                  key={date}
                  className={`heat-cell level-${activityLevel(count)}`}
                  title={`${count} ${count === 1 ? "submission" : "submissions"} on ${date}`}
                  aria-label={`${count} ${count === 1 ? "submission" : "submissions"} on ${date}`}
                />
              ))}
            </div>
            <div className="activity-days">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
          </div>

          <aside className="leetcode-side-stats">
            <h3>Algorithms Focus</h3>
            <div className="mini-stat">
              <span className="stat-icon flame">
                <Flame size={17} />
              </span>
              <span>
                Language <strong>C++ &amp; JavaScript</strong>
              </span>
            </div>
            <div className="mini-stat">
              <span className="stat-icon trophy">
                <Trophy size={17} />
              </span>
              <span>
                Core Focus <strong>Arrays, Trees, DP</strong>
              </span>
            </div>
            <div className="mini-stat">
              <span className="stat-icon rank">
                <BarChart3 size={17} />
              </span>
              <span>
                Foundation <strong>DSA &amp; OOP</strong>
              </span>
            </div>
            <div className="mini-stat">
              <span className="stat-icon submissions">
                <FileCode2 size={17} />
              </span>
              <span>
                Submissions <strong>{stats.submissions}+ Total</strong>
              </span>
            </div>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}

function Achievements() {
  return (
    <section className="section achievements-section" id="achievements">
      <Reveal>
        <SectionHeading
          number="06"
          title="Achievements &amp; Certificates"
          subtitle="National hackathon recognition and professional AI credentials"
        />

        <div className="achievements-showcase-grid">
          <div className="achievements-column">
            <h3 className="sub-column-heading">
              <Trophy size={18} /> Key Achievements
            </h3>
            <div className="achievement-list">
              {achievements.map((item, index) => (
                <Reveal key={item.title} delay={index * 50}>
                  <article className="achievement-card">
                    <span className="achievement-mark">{item.mark}</span>
                    <div className="achievement-body">
                      <div className="achievement-meta">
                        <span className="achievement-tag">{item.tag}</span>
                        <time>{item.years}</time>
                      </div>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="certificates-column">
            <h3 className="sub-column-heading">
              <Award size={18} /> Verified Certificates
            </h3>
            <div className="certificate-banner-card">
              <div className="certificate-banner-content">
                <div className="cert-badge-glow">
                  <Sparkles size={14} /> Prelims · Top 20
                </div>
                <h4>Smart India Hackathon (SIH) 2026</h4>
                <p>Top 20 position in SIH 2026 Prelims.</p>
                <a className="cert-view-btn" href="https://drive.google.com/file/d/1gFifk7J_r3ez2NB82fHJLtdyIDsRnv9k/view" target="_blank" rel="noreferrer">
                  <Eye size={13} /> View
                </a>
              </div>
            </div>
            <div className="certificate-list">
              {certificates.map((cert) => (
                <article key={cert.title} className="certificate-item">
                  <div className="cert-icon-wrap">
                    <FileText size={18} />
                  </div>
                  <div className="cert-copy">
                    <div className="cert-meta">
                      <span className="cert-badge">{cert.badge}</span>
                      <span>{cert.year}</span>
                    </div>
                    <h4>{cert.title}</h4>
                    <p>{cert.issuer}</p>
                  </div>
                  <a className="cert-view-btn" href={cert.link} target="_blank" rel="noreferrer" title={`View ${cert.title}`}>
                    <Eye size={13} /> View
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Journey() {
  return (
    <section className="section journey-section" id="journey">
      <Reveal>
        <SectionHeading
          number="07"
          title="Responsibility &amp; Education"
          subtitle="Leadership roles and academic qualifications from Vandana Convent School to JECRC University"
        />

        <div className="journey-dual-grid">
          <div className="journey-column">
            <h3 className="journey-heading">
              <BriefcaseBusiness size={18} /> Position of Responsibility
            </h3>
            <div className="timeline-group">
              {responsibilities.map((resp) => (
                <article key={resp.role} className="journey-card leadership-card">
                  <div className="journey-card-header">
                    <span className="journey-icon-wrap cr-badge">
                      <Users size={16} />
                    </span>
                    <div>
                      <h4>{resp.role}</h4>
                      <p className="journey-org">{resp.organization}</p>
                    </div>
                    <time className="journey-time">{resp.period}</time>
                  </div>
                  <ul className="journey-bullets">
                    {resp.bullets.map((b, i) => (
                      <li key={i}>
                        <span className="bullet-dot">▹</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="journey-column">
            <h3 className="journey-heading">
              <GraduationCap size={18} /> Academic Journey
            </h3>
            <div className="timeline-group">
              {educationList.map((edu, idx) => (
                <article key={edu.degree} className="journey-card edu-card">
                  <div className="journey-card-header">
                    <span className="journey-icon-wrap edu-badge">
                      <GraduationCap size={16} />
                    </span>
                    <div>
                      <h4>{edu.degree}</h4>
                      <p className="journey-org">
                        {edu.institution} · <small>{edu.location}</small>
                      </p>
                    </div>
                    <time className="journey-time">{edu.period}</time>
                  </div>
                  {edu.score && (
                    <div className="cgpa-pill">
                      <span>Academic Score:</span>
                      <strong>{edu.score}</strong>
                    </div>
                  )}
                  <ul className="journey-bullets">
                    {edu.highlights.map((h, i) => (
                      <li key={i}>
                        <span className="bullet-dot">▹</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Contact() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <section className="section contact-section" id="contact">
      <Reveal>
        <SectionHeading
          number="08"
          title="Let's Connect"
          subtitle="Looking for an enthusiastic SDE / Full-Stack / AI Intern? Let’s talk!"
        />

        <div className="contact-grid">
          <div className="contact-info-panel">
            <h3>Get In Touch</h3>
            <p>
              I am actively seeking software engineering internships, collaborative web/AI projects, and developer
              opportunities. Feel free to reach out directly via email, phone, or LinkedIn!
            </p>

            <div className="contact-items-list">
              <a className="contact-item-card" href={`mailto:${personalInfo.email}`}>
                <div className="contact-item-icon mail-icon">
                  <Mail size={18} />
                </div>
                <div className="contact-item-copy">
                  <small>Email</small>
                  <strong>{personalInfo.email}</strong>
                  <span>{personalInfo.phone}</span>
                </div>
                <ArrowUpRight size={14} className="contact-item-arrow" />
              </a>

              <a
                className="contact-item-card"
                href={personalInfo.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <div className="contact-item-icon linkedin-icon">
                  <Linkedin size={18} />
                </div>
                <div className="contact-item-copy">
                  <small>LinkedIn</small>
                  <strong>linkedin.com/in/{personalInfo.linkedinDisplay}</strong>
                  <span>Connect &amp; Message</span>
                </div>
                <ArrowUpRight size={14} className="contact-item-arrow" />
              </a>

              <a
                className="contact-item-card"
                href={personalInfo.github}
                target="_blank"
                rel="noreferrer"
              >
                <div className="contact-item-icon github-icon">
                  <Github size={18} />
                </div>
                <div className="contact-item-copy">
                  <small>GitHub</small>
                  <strong>github.com/{personalInfo.githubDisplay}</strong>
                  <span>Explore Repos &amp; Commits</span>
                </div>
                <ArrowUpRight size={14} className="contact-item-arrow" />
              </a>

              <a className="contact-item-card" href={`tel:${personalInfo.phone}`}>
                <div className="contact-item-icon phone-icon">
                  <Phone size={18} />
                </div>
                <div className="contact-item-copy">
                  <small>Phone / WhatsApp</small>
                  <strong>{personalInfo.phone}</strong>
                  <span>Direct Calls &amp; Messages</span>
                </div>
                <ArrowUpRight size={14} className="contact-item-arrow" />
              </a>
            </div>
          </div>

          <div className="contact-action-panel">
            <div className="action-card-inner">
              <div className="paper-plane-scene" aria-hidden="true">
                <span className="flight-path">〰〰〰➜</span>
                <Send size={28} />
              </div>
              <h4>Direct Email Dispatch</h4>
              <p>
                Click below to launch your default email client with a pre-filled subject, or copy my email address with
                one click.
              </p>

              <div className="contact-action-buttons">
                <a
                  className="button-primary message-button"
                  href={`mailto:${personalInfo.email}?subject=Internship%20/%20Opportunity%20for%20Kartikey%20Upadhyay`}
                >
                  <Mail size={16} /> Send an Email
                </a>
                <button className="button-outline copy-button" onClick={copyEmail}>
                  {copiedEmail ? <Check size={15} className="text-green" /> : <Copy size={15} />}
                  {copiedEmail ? "Email Copied!" : "Copy Email"}
                </button>
              </div>

              <div className="location-badge">
                <MapPin size={13} /> Based in Jaipur, Rajasthan · Open to relocate / remote
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [readme, setReadme] = useState(project.description);
  const [readmeLoading, setReadmeLoading] = useState(false);

  useEffect(() => {
    if (!project.repositoryUrl) return;
    let active = true;
    setReadmeLoading(true);
    loadReadme(project.repositoryUrl)
      .then((content) => {
        if (active && content) setReadme(content);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReadmeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [project]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="dialog-scrim"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
        <button className="dialog-close" onClick={onClose} aria-label="Close project details">
          <X size={18} />
        </button>

        <div className="dialog-image-header">
          <img src={project.image} alt={project.name} className="dialog-img" />
          <div className="dialog-image-shade" />
          <div className="dialog-badge-floating">
            <span>{project.kind === "ai-nutrition" ? "🥗 AI Health Assistant" : "🤖 Conversational AI"}</span>
          </div>
        </div>

        <div className="dialog-copy">
          <span className="dialog-label">PROJECT SPOTLIGHT</span>
          <h2 id="project-dialog-title">{project.name}</h2>
          <p className="dialog-tagline">{project.tagline}</p>

          <p className="dialog-main-desc">{project.description}</p>

          <div className="dialog-highlights">
            <h4>Key Innovations &amp; Features:</h4>
            <ul>
              {project.bullets.map((b, i) => (
                <li key={i}>
                  <span className="bullet-dot">▹</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="project-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="dialog-footer-actions">
            {project.demoUrl && (
              <a className="button-primary small-button" href={project.demoUrl} target="_blank" rel="noreferrer">
                Live Demo <ExternalLink size={13} />
              </a>
            )}
            <a
              className="button-outline small-button"
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={14} /> View GitHub Source
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResumeModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="dialog-scrim"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="resume-modal-card" role="dialog" aria-modal="true" aria-label="Resume Preview">
        <div className="resume-modal-header">
          <div className="resume-modal-title">
            <FileText size={18} className="text-cyan" />
            <div>
              <h3>Kartikey Upadhyay — Resume</h3>
              <small>BCA (AI &amp; ML) · Full-Stack Developer · JECRC University</small>
            </div>
          </div>
          <div className="resume-modal-actions">
            <a
              className="button-primary small-button"
              href={personalInfo.resumeUrl}
              download="Kartikey_Upadhyay_Resume.pdf"
            >
              <Download size={14} /> Download PDF
            </a>
            <a
              className="button-outline small-button"
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} /> Open in New Tab
            </a>
            <button className="dialog-close-static" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="resume-iframe-wrap">
          <iframe
            src={`${personalInfo.resumeUrl}#toolbar=1&navpanes=0`}
            title="Kartikey Upadhyay Resume PDF"
            className="resume-iframe"
          />
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [leetcode, setLeetcode] = useState<LeetCodeStats>({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    currentStreak: 0,
    longestStreak: 0,
    ranking: "Loading…",
    submissions: 0,
    activity: [],
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    let active = true;
    loadProjects()
      .then((result) => {
        if (active) setProjects(result.projects);
      })
      .catch(() => {
        if (active) setProjectsError(true);
      })
      .finally(() => {
        if (active) setProjectsLoading(false);
      });
    loadLeetCodeStats()
      .then((result) => {
        if (active) setLeetcode(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const targets = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: [0, 0.2, 0.5, 0.8] }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`portfolio ${lightMode ? "light-mode" : ""}`}>
      <ScrollProgress />
      <header className="topbar">
        <a className="brand-mark" href="#home" aria-label="Kartikey Upadhyay home">
          <span>KU</span>
        </a>
        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={activeId === item.id ? "nav-active" : ""}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="theme-button"
          onClick={() => setLightMode((current) => !current)}
          aria-label={lightMode ? "Switch to dark theme" : "Switch to light theme"}
        >
          {lightMode ? <Moon size={15} /> : <Sun size={15} />}
        </button>
        <button className="resume-button" onClick={() => setResumeOpen(true)}>
          Resume <Eye size={12} />
        </button>
        <button
          className="menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <main className="portfolio-main">
        <Hero onResumePreview={() => setResumeOpen(true)} leetcodeTotal={leetcode.total} />
        <About onResumePreview={() => setResumeOpen(true)} />
        <Skills />
        <Projects
          projects={projects}
          loading={projectsLoading}
          error={projectsError}
          onOpen={setSelectedProject}
        />
        <LeetCode stats={leetcode} />
        <Achievements />
        <Journey />
        <Contact />
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#home">
          KU
        </a>
        <span>
          © 2026 Kartikey Upadhyay · Built with React, Next.js &amp; Tailwind · JECRC University, Jaipur
        </span>
        <div className="footer-links">
          <a href={personalInfo.github} target="_blank" rel="noreferrer">
            <Github size={14} /> GitHub
          </a>
          <a href={personalInfo.linkedin} target="_blank" rel="noreferrer">
            <Linkedin size={14} /> LinkedIn
          </a>
          <a href="#home">
            Back to top <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>

      {selectedProject && <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {resumeOpen && <ResumeModal onClose={() => setResumeOpen(false)} />}
    </div>
  );
}
