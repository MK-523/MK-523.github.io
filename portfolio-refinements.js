(() => {
  const skills = [
    {
      title: "Production engineering",
      list: "Python · TypeScript · React · ReactFlow · SQL",
      evidence: "Flex · ChessStalker · US Chess",
    },
    {
      title: "Systems and runtime research",
      list: "Linux · Docker · Kubernetes · OpenFaaS · Redis · gdb",
      evidence: "UCLA PSS Lab · serverless artifact caching",
    },
    {
      title: "Applied ML and computer vision",
      list: "PyTorch · JAX / Flax / XLA · OpenCV · BERT · NLP",
      evidence: "A-Eye · SAT policy audit · sentiment-to-music",
    },
    {
      title: "Languages and foundations",
      list: "Java · C++ · Rust · Shell · OCaml · TCP/IP · distributed systems · network security",
      evidence: "Research tooling · systems coursework · independent builds",
    },
  ];

  const caseStudies = [
    {
      number: "01",
      category: "Product engineering",
      title: "ChessStalker",
      role: "Co-founder / Full-stack Engineer",
      summary:
        "A cross-platform opponent-preparation system that resolves player identities across FIDE, Lichess, and Chess.com, then turns fragmented game histories into searchable profiles and Stockfish-backed preparation.",
      metrics: [
        ["11M+", "official games indexed"],
        ["100K+", "engine analyses produced"],
        ["3 sources", "FIDE · Lichess · Chess.com"],
      ],
      details: [
        [
          "Challenge",
          "A player’s competitive history is split across official ratings and multiple online identities, which makes useful opponent research slow and incomplete.",
        ],
        [
          "System",
          "Combined source-specific ingestion, identity resolution, searchable player histories, and Stockfish analysis into one preparation workflow.",
        ],
        [
          "My contribution",
          "Co-designed the product and built full-stack features across data integration, analysis workflows, and the player-facing preparation experience.",
        ],
      ],
      flow: ["Resolve identity", "Ingest games", "Run analysis", "Build opponent brief"],
      href: "https://chessstalker.com/",
      linkLabel: "Open ChessStalker",
    },
    {
      number: "02",
      category: "Runtime research",
      title: "Persisting JIT state across serverless cold starts",
      role: "Undergraduate Research Assistant · UCLA PSS Lab",
      summary:
        "A Redis-backed artifact path for OpenFaaS workloads that preserves profiling and compilation work instead of rebuilding it for every bursty first request.",
      metrics: [
        ["337 → 125 ms", "first-request latency"],
        ["2.7×", "faster first request"],
        ["31.6%", "less compile / load time"],
      ],
      details: [
        [
          "Challenge",
          "Serverless instances repeatedly paid startup costs for runtime profiling and compilation artifacts that had already been produced by earlier instances.",
        ],
        [
          "System",
          "Added Redis-backed persistence to the OpenFaaS runtime path, containerized the benchmark workloads, and traced artifact behavior with gdb.",
        ],
        [
          "Measurement",
          "Compared first-request behavior against the uncached baseline and separated end-to-end latency from startup compile and load time.",
        ],
      ],
      flow: ["Cold request", "Artifact lookup", "Redis-backed restore", "Execute with reused state"],
      href: "https://github.com/MK-523/hivejit-openfaas",
      linkLabel: "View runtime experiments",
    },
  ];

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const buildCaseStudy = (study) => {
    const article = element("article", "case-study");
    article.dataset.bladeTarget = "";
    article.append(element("div", "case-study-index", study.number));

    const main = element("div", "case-study-main");
    const top = element("div", "case-study-top");
    const heading = element("div", "case-study-heading");
    heading.append(
      element("p", "case-study-kicker", study.category),
      element("h3", "", study.title),
      element("p", "case-study-role", study.role),
      element("p", "case-study-summary", study.summary),
    );

    const metrics = element("aside", "case-study-metrics");
    metrics.setAttribute("aria-label", `${study.title} results`);
    metrics.append(element("p", "", "Evidence"));
    study.metrics.forEach(([value, label]) => {
      const metric = element("div", "case-study-metric");
      metric.append(element("strong", "", value), element("span", "", label));
      metrics.append(metric);
    });
    top.append(heading, metrics);

    const detailGrid = element("div", "case-study-detail-grid");
    study.details.forEach(([label, text]) => {
      const detail = element("div", "case-study-detail");
      detail.append(element("h4", "", label), element("p", "", text));
      detailGrid.append(detail);
    });

    const flow = element("div", "case-study-flow");
    flow.setAttribute("aria-label", `${study.title} system flow`);
    study.flow.forEach((step, index) => {
      const flowStep = element("div", "case-study-step");
      flowStep.append(
        element("span", "", String(index + 1).padStart(2, "0")),
        element("strong", "", step),
      );
      flow.append(flowStep);
    });

    const link = element("a", "case-link case-study-link");
    link.href = study.href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.dataset.bladeTarget = "";
    link.append(document.createTextNode(`${study.linkLabel} `), element("span", "", "↗"));

    main.append(top, detailGrid, flow, link);
    article.append(main);
    return article;
  };

  const addCaseStudies = () => {
    if (document.getElementById("case-studies")) return;

    const research = document.getElementById("research");
    if (!research) return;

    const section = element("section", "case-studies-section");
    section.id = "case-studies";
    section.tabIndex = -1;

    const sectionHeading = element("div", "section-heading compact");
    const headingText = element("div");
    headingText.append(
      element("h2", "", "How the systems work"),
      element("span", "", "Product architecture · runtime research · measurable evidence"),
    );
    sectionHeading.append(element("p", "", "Case studies"), headingText);

    const list = element("div", "case-study-list");
    caseStudies.forEach((study) => list.append(buildCaseStudy(study)));
    section.append(sectionHeading, list);
    research.before(section);

    const simpleChessStalker = Array.from(document.querySelectorAll("a.experiment")).find(
      (project) => project.querySelector("h3")?.textContent?.trim() === "ChessStalker",
    );
    simpleChessStalker?.remove();
  };

  const categorizeSkills = () => {
    const awards = document.getElementById("awards");
    const technicalColumn = awards?.querySelectorAll(".about-column")[1];
    if (!technicalColumn || technicalColumn.querySelector(".skill-row")) return;

    technicalColumn.classList.add("technical-column");
    technicalColumn.replaceChildren(element("p", "section-label", "Technical range by use"));
    skills.forEach((skill) => {
      const row = element("div", "about-row skill-row");
      row.append(
        element("h3", "", skill.title),
        element("p", "skill-list", skill.list),
        element("span", "skill-evidence", `Seen in: ${skill.evidence}`),
      );
      technicalColumn.append(row);
    });
  };

  const updateNavigation = () => {
    const nav = document.querySelector(".site-header nav");
    if (!nav || nav.querySelector('a[href="#case-studies"]')) return;
    const awardsLink = nav.querySelector('a[href="#awards"]');
    if (!awardsLink) return;
    awardsLink.href = "#case-studies";
    awardsLink.textContent = "Case studies";
    awardsLink.dataset.bladeTarget = "";
  };

  const enhance = () => {
    if (!document.querySelector(".site-header.is-ready")) return false;
    updateNavigation();
    addCaseStudies();
    categorizeSkills();
    return true;
  };

  const start = () => {
    if (enhance()) return;

    const observer = new MutationObserver(() => {
      if (!enhance()) return;
      observer.disconnect();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
