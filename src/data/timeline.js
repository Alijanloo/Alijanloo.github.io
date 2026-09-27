// Timeline data for the About page (from CV, 2025 version).
// To add a new entry, insert an object into this array — the order here
// is the order shown on the page (oldest first).
//
// Fields:
//   year        — small muted label, e.g. "2024 — 2026"
//   title       — large bold heading of the card
//   subtitle    — role / organization line
//   type        — "work" | "education" | "research" | "project" (drives the dot icon)
//   description — short body text shown on the card
//   highlights  — full bullet points shown in the detail modal
//   tags        — optional array of skill / tech chips
//   link        — optional URL shown in the detail modal

export const timelineData = [
  {
    year: "2020 — 2025",
    title: "B.Sc. in Computer Science",
    subtitle: "Ferdowsi University of Mashhad",
    type: "education",
    description:
      "Five years of computer science with a focus on machine learning and natural language processing — GPA 3.31/4.",
    highlights: [
      "Specialized focus on Large Language Models, Agentic Workflows, and MLOps.",
      "Combined academic research with practical software engineering to deploy scalable AI solutions.",
      "GPA: 3.31/4.",
    ],
    tags: ["GPA 3.31/4", "ML", "NLP"],
  },
  {
    year: "2021 — 2023",
    title: "AI & Software Engineer",
    subtitle: "Freelance",
    type: "work",
    description:
      "Engineered end-to-end AI solutions for SMEs — custom chatbots, document analysis tools, a fraud-scoring pipeline that cut false positives by 30%, and real-time ETL with PySpark.",
    highlights: [
      "Engineered end-to-end AI solutions for SMEs, including custom chatbots and document analysis tools.",
      "Built a fraud-scoring pipeline (Python/TensorFlow/Kafka) that reduced false positives by 30% while ensuring GDPR compliance.",
      "Developed real-time ETL pipelines processing e-commerce logs via PySpark and RabbitMQ for instant analytics.",
    ],
    tags: ["Chatbots", "TensorFlow", "Kafka", "PySpark"],
  },
  {
    year: "2023 — 2024",
    title: "AI Engineer",
    subtitle: "Vera110",
    type: "work",
    description:
      "Built deep learning models for ASR, pronunciation assessment, and grammatical error correction for an English-learning app; fine-tuned GPT models with LoRA and sped up inference 1.5× via distillation and quantization.",
    highlights: [
      "Built an educational app for English language learners, developing Deep Learning models for ASR, Pronunciation Assessment, and Grammatical Error Correction.",
      "Fine-tuned GPT-based language models for domain-specific tasks using LoRA (Low-Rank Adaptation) to improve educational content generation.",
      "Optimized model inference speed by 1.5x using Knowledge Distillation and Post-Training Quantization (PTQ).",
      "Built automated NLP workflows using spaCy to replace manual data entry, increasing data processing throughput by 60%.",
    ],
    tags: ["ASR", "LoRA", "spaCy", "Quantization"],
  },
  {
    year: "2024 — 2026",
    title: "AI Engineer",
    subtitle: "ParsTech AI",
    type: "work",
    description:
      "Architected 10+ LangGraph agents and hierarchical context-aware RAG chunking that lifted RAGAS Faithfulness by 20%; engineered a FastAPI/Redis layer that cut latency by 40% and deployed on AWS ECS with CI/CD.",
    highlights: [
      "RAG Optimization: Diagnosed and resolved low retrieval accuracy in unstructured data pipelines by implementing a hierarchical context-aware chunking strategy — improving RAGAS Faithfulness by 20%.",
      "Agentic Frameworks: Architected 10+ LangGraph agents for the Parschat platform, including a semantic-powered Sales Assistant leveraging product attributes and user intent analysis.",
      "Microservices: Engineered a high-throughput FastAPI layer using Asyncio/Redis, reducing latency by 40% and ensuring thread-safe handling of concurrent agent requests.",
      "Infrastructure: Deployed containerized services on AWS ECS/RDS with auto-scaling and established CI/CD pipelines via GitHub Actions.",
    ],
    tags: ["LangGraph", "RAG", "FastAPI", "AWS"],
  },
  {
    year: "2024 — 2025",
    title: "Teaching Assistant — Artificial Intelligence",
    subtitle: "Ferdowsi University of Mashhad",
    type: "education",
    description:
      "Mentored undergraduates in the Fundamentals of AI course — search algorithms, CSP, evolutionary algorithms, and adversarial search — designing projects that bridged theory with Python.",
    highlights: [
      "Mentored undergraduate students in the Fundamentals of Artificial Intelligence course, focusing on search algorithms and optimization.",
      "Designed curriculum projects covering CSP, Evolutionary Algorithms, and Adversarial Search (MinMax), bridging theory with Python implementation.",
    ],
    tags: ["Teaching", "Search Algorithms", "Optimization"],
  },
  {
    year: "2026",
    title: "Resolving Cryo-EM Structure with Machine Learning",
    subtitle: "International Journal of Molecular Sciences · Co-author",
    type: "research",
    description:
      "A novel machine-learning based method for resolving secondary structure topology in medium-resolution Cryo-EM.",
    highlights: [
      "Co-authored a novel machine-learning based method for resolving secondary structure topology in medium-resolution Cryo-EM.",
      "Published in the International Journal of Molecular Sciences.",
    ],
    tags: ["Machine Learning", "Cryo-EM", "Bioinformatics"],
    link: "https://doi.org/10.3390/ijms27104388",
  },
  {
    year: "2026 — Present",
    title: "AI Engineer",
    subtitle: "Smilinno",
    type: "work",
    description:
      "Building topic modeling and hierarchical clustering for CRM file histories and live chatbot conversations on the Hamhoush platform — batch and async pipelines orchestrated with Elasticsearch, MongoDB, RabbitMQ, and Celery.",
    highlights: [
      "Built a topic modeling service for CRM-style file histories and active chatbot conversations on the Hamhoush platform.",
      "Developed hierarchical topic clustering and insight extraction pipelines to produce recommendations aligned with different managers' needs.",
      "Orchestrated batch and asynchronous processing with Elasticsearch, MongoDB, RabbitMQ, and Celery to support scalable analytics workflows.",
    ],
    tags: ["Topic Modeling", "Elasticsearch", "RabbitMQ", "Celery"],
  },
];

export const typeIcons = {
  work: "💼",
  education: "🎓",
  research: "🔬",
  project: "🚀",
};
