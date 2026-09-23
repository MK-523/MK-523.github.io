export const roles = [
  {
    track: "experience",
    organization: "Flex",
    dates: "Summer 2026",
    role: "Software Engineering Intern",
    focus: "Underwriting infrastructure · Financial risk tooling",
    summary:
      "Built backend and visualization tooling that made dense production underwriting logic inspectable for engineers and operators.",
    responsibilities: [
      "Built Python and TypeScript workflows with React and ReactFlow decision traces.",
      "Connected applicant inputs, rules, calculations, and outcomes in one review path.",
      "Structured type-safe decision logic for auditability and operator use.",
    ],
    results: [
      { value: "30–60 min → <5 min", label: "workflow walkthroughs" },
      { value: "2 workflows", label: "41 calculation steps visualized" },
      {
        value: "10 models",
        label: "approval, decline, and credit-limit logic",
      },
    ],
  },
  {
    track: "research",
    organization: "UCLA Programmable Software Systems Lab",
    dates: "2025 — Present",
    role: "Undergraduate Research Assistant",
    focus: "JVM / Serverless runtime performance",
    summary:
      "Researching how profiling and compilation artifacts can persist across OpenFaaS cold starts instead of being rebuilt for every bursty workload.",
    responsibilities: [
      "Designed Redis-backed caching for runtime and compilation artifacts.",
      "Benchmarked first-request behavior in Dockerized OpenFaaS workloads.",
      "Traced and validated runtime behavior with gdb.",
    ],
    results: [
      { value: "337 → 125 ms", label: "first-request latency" },
      { value: "2.7×", label: "faster first request" },
      { value: "31.6%", label: "less startup compile / load time" },
    ],
    link: "https://github.com/MK-523/hivejit-openfaas",
    linkLabel: "View runtime experiments",
  },
  {
    track: "experience",
    organization: "US Chess",
    dates: "2023 — 2024",
    role: "Web Developer Intern",
    focus: "Chess Life archive · Data and editorial systems",
    summary:
      "Helped build a searchable digital archive and SQL-backed retrieval workflow for decades of Chess Life issues.",
    responsibilities: [
      "Developed database-backed search and retrieval for archived magazine issues.",
      "Supported the Drupal and Pantheon editorial publishing workflow.",
      "Made historical content easier for readers and editors to locate and explore.",
    ],
    results: [
      { value: "250K+", label: "monthly readers served by the platform" },
      { value: "SQL-backed", label: "archive search and retrieval" },
    ],
    link: "https://new.uschess.org/chess-life-digital-archives",
    linkLabel: "Open Chess Life archive",
  },
  {
    track: "research",
    organization: "UC Santa Barbara",
    dates: "2022 — 2025",
    role: "Research Assistant",
    focus: "Network systems · Adaptive bitrate experiments",
    summary:
      "Studied adaptive bitrate behavior under changing throughput and latency, turning multi-year experiments into comparable congestion evidence.",
    responsibilities: [
      "Compared adaptive bitrate strategies across controlled network conditions.",
      "Analyzed packet traces and TCP/IP simulation output.",
      "Produced comparable evidence from three years of experiments.",
    ],
    results: [
      { value: "10K+", label: "packet samples analyzed" },
      { value: "6+", label: "adaptive bitrate variants compared" },
      { value: "SIGCOMM ’24", label: "research supported" },
    ],
  },
];

export const projects = [
  {
    category: "product",
    title: "ChessStalker",
    role: "Co-founder / Full-stack Engineer",
    summary:
      "Built a cross-platform opponent-preparation product that resolves player identities across FIDE, Lichess, and Chess.com and turns fragmented game histories into searchable, Stockfish-backed preparation.",
    bullets: [
      "Designed ingestion and identity-resolution workflows across official and online chess data.",
      "Built searchable player profiles and analysis flows for concrete opponent preparation.",
      "Worked across product design, data integration, engine analysis, and the user-facing application.",
    ],
    impact:
      "11M+ official games indexed · 100K+ engine analyses · 3 integrated data sources",
    stack: "Product engineering · data integration · Stockfish",
    href: "https://chessstalker.com/",
    linkLabel: "Open ChessStalker",
  },
  {
    category: "product",
    title: "A-Eye",
    role: "Co-creator / Computer Vision Engineer",
    summary:
      "Built priority-aware spoken guidance from a wearable camera with Arya Kunisetty, Krishay Garg, and Hui-Peng-John-Yao.",
    bullets: [
      "Combined YOLOv8 detections with ByteTrack to preserve object identity across frames.",
      "Designed route-aware audio guidance that prioritized actionable obstacles instead of narrating every detection.",
    ],
    impact: "1st of 76 teams · MLH Best Use of ElevenLabs",
    stack: "YOLOv8 · ByteTrack · computer vision · audio guidance",
    href: "https://devpost.com/software/a-eye-pk9sdw",
    linkLabel: "Open project",
  },
  {
    category: "investigation",
    title: "SAT Policy Audit",
    role: "Model Evaluation / Reliability",
    summary:
      "Audited a reinforcement-learning SAT policy and built deterministic evaluation to separate implementation failures from policy quality.",
    bullets: [
      "Found a tensor-shape failure and formula-independent behavior in the evaluation path.",
      "Tested the corrected system over 600 held-out 3-CNF formulas with exact, repeatable scoring.",
    ],
    impact: "600 held-out formulas · deterministic evaluation",
    stack: "PyTorch · reinforcement learning · exact evaluation",
    href: "https://github.com/MK-523/BooleanSatisfiability/tree/main/benchmark",
    linkLabel: "View benchmark",
  },
  {
    category: "investigation",
    title: "Sentiment → Music",
    role: "Applied ML Prototype Builder",
    summary:
      "Built an end-to-end prototype connecting language-model sentiment representations, expressive music generation, and an alternate Braille-to-music interaction layer.",
    bullets: [
      "Mapped sentiment features from language models into controllable musical output.",
      "Explored a tokenized Braille interface as an alternate input and composition mechanism.",
    ],
    impact: "End-to-end multimodal prototype",
    stack: "BERT · NLTK · music AI",
    href: "https://github.com/MK-523/NLP-music-sentimentanalysis",
    linkLabel: "View project",
  },
];

export const campusRoles = [
  {
    title: "VEST at UCLA",
    role: "Board Member, Finance",
    dates: "2026 — Present",
    summary:
      "Help build the operating systems behind UCLA's student builder and startup community—from budgeting and sponsorships to founder talks, venture panels, office visits, and community programming.",
    bullets: [
      "Own speaker outreach, partner relations, budgeting, and event logistics for LA Tech Week programming.",
      "Coordinate with a16z, Cognition, and startup and venture partners across the Los Angeles ecosystem.",
    ],
    impact: "40-member builder community · LA Tech Week operations",
    stack: "Finance · partnerships · event operations",
  },
  {
    title: "UCLA Unmanned Aerial Systems",
    role: "Computer Vision Team",
    dates: "Oct 2025 — Present",
    summary:
      "Developed the perception and control loop for an autonomous drone that tracks people in real time under changing motion and camera conditions.",
    bullets: [
      "Integrated YOLO and OpenCV detections into a ROS-based flight-control pipeline.",
      "Tuned PID control for responsive target following at real-time inference rates.",
    ],
    impact: "50 FPS dynamic tracking",
    stack: "YOLO · OpenCV · ROS · PID control",
  },
];

export const skills = [
  [
    "Languages",
    "Python · TypeScript · JavaScript · Java · C++ · SQL · Rust · Shell · OCaml",
  ],
  [
    "Product + ML",
    "React · ReactFlow · PyTorch · JAX / Flax / XLA · BERT · NLP · OpenCV",
  ],
  [
    "Systems + Databases",
    "Linux · Git · Docker · Kubernetes · OpenFaaS · Redis · TCP/IP · serverless computing · SQL backends · query execution · gdb · monitoring",
  ],
  [
    "Security + Core CS",
    "Access control · network security · data structures · algorithms · OOP · distributed systems · performance benchmarking",
  ],
];

export const recognition = [
  [
    "Former US Chess Top 100 Junior",
    "National junior ranking · Competitive chess",
  ],
  ["USNCO Finalist", "USA National Chemistry Olympiad"],
  ["A-Eye: MLH Best Use of ElevenLabs Winner", "LA Hacks · 1st of 76 teams"],
  ["Stanford HAI AI+Education Summit", "Table presenter"],
  ["ACM SIGCOMM ’24", "Research contributor"],
];
