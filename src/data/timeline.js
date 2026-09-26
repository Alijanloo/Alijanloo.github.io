// Timeline data for the About page.
// To add a new entry, append an object to this array (newest or oldest
// first — the order here is the order shown on the page).
//
// Fields:
//   year       — small muted label, e.g. "2024" or "2022 — 2023"
//   title      — large bold heading of the card
//   subtitle   — optional role / organization line
//   type       — "work" | "education" | "research" | "project" (drives the dot icon)
//   description— short body text
//   tags       — optional array of skill / tech chips

export const timelineData = [
  {
    year: "2019",
    title: "B.Sc. in Computer Science",
    subtitle: "Ferdowsi University of Mashhad",
    type: "education",
    description:
      "Started my journey in computer science — algorithms, data structures, and the math that powers modern machine learning.",
    tags: ["Algorithms", "Math", "C++"],
  },
  {
    year: "2022",
    title: "Machine Learning Research",
    subtitle: "Natural Language Processing Lab",
    type: "research",
    description:
      "Dived into NLP research — exploring transformers, language models, and Persian text processing. Published coursework and lab projects on sequence modeling.",
    tags: ["NLP", "PyTorch", "Transformers"],
  },
  {
    year: "2023",
    title: "Graduated with Honors",
    subtitle: "Ferdowsi University of Mashhad",
    type: "education",
    description:
      "Completed my B.Sc. in Computer Science with a focus on machine learning and natural language processing.",
    tags: ["Computer Science", "ML"],
  },
  {
    year: "2023 — Present",
    title: "Machine Learning Engineer",
    subtitle: "ParsTech AI",
    type: "work",
    description:
      "Designing and shipping Agentic chatbots and production AI solutions for businesses — from RAG pipelines to evaluation and deployment.",
    tags: ["LangChain", "FastAPI", "Docker", "RAG"],
  },
  {
    year: "2024",
    title: "Open Source & Data Tooling",
    subtitle: "Side Projects",
    type: "project",
    description:
      "Building open-source tools for automation and data analysis in my free time — because scratching your own itch is the best roadmap.",
    tags: ["Python", "Elasticsearch", "OpenCV"],
  },
];

export const typeIcons = {
  work: "💼",
  education: "🎓",
  research: "🔬",
  project: "🚀",
};
