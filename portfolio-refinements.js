(() => {
  const skills = [
    ["Production", "Python · TypeScript · React · ReactFlow · SQL"],
    ["Systems", "Linux · Docker · Kubernetes · OpenFaaS · Redis · gdb"],
    ["Applied ML", "PyTorch · JAX / Flax / XLA · OpenCV · BERT · NLP"],
    ["Additional", "Java · C++ · Rust · Shell · OCaml · TCP/IP · distributed systems · network security"],
  ];

  const projects = [
    {
      title: "ChessStalker",
      role: "Co-founder / Full-stack Engineer",
      summary:
        "Built a cross-platform opponent-preparation product that resolves player identities across FIDE, Lichess, and Chess.com and turns fragmented game histories into searchable, Stockfish-backed preparation.",
      bullets: [
        "Designed ingestion and identity-resolution workflows across official and online chess data.",
        "Built searchable player profiles and analysis flows for concrete opponent preparation.",
        "Worked across product design, data integration, engine analysis, and the user-facing application.",
      ],
      impact: "11M+ official games indexed · 100K+ engine analyses · 3 integrated data sources",
      stack: "Product engineering · data integration · Stockfish",
      href: "https://chessstalker.com/",
      linkLabel: "Open ChessStalker",
    },
    {
      title: "JIT State Persistence for OpenFaaS",
      role: "Undergraduate Research Assistant · UCLA PSS Lab",
      summary:
        "Built a Redis-backed artifact path that preserves profiling and compilation work across serverless cold starts instead of rebuilding it for every bursty first request.",
      bullets: [
        "Added artifact lookup and restore to the OpenFaaS runtime path.",
        "Containerized benchmark workloads and traced runtime behavior with gdb.",
        "Separated first-request latency from startup compile and load costs against an uncached baseline.",
      ],
      impact: "337 → 125 ms first request · 2.7× faster · 31.6% less compile / load time",
      stack: "OpenFaaS · Redis · Docker · gdb · runtime benchmarking",
      href: "https://github.com/MK-523/hivejit-openfaas",
      linkLabel: "View runtime experiments",
    },
    {
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

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const buildSectionHeading = (title) => {
    const heading = element("div", "resume-section-heading");
    heading.append(element("h2", "", title));
    return heading;
  };

  const replaceSectionHeading = (section, title) => {
    const existing = section.querySelector(":scope > .section-heading, :scope > .resume-section-heading");
    if (!existing || existing.classList.contains("resume-section-heading")) return;
    existing.replaceWith(buildSectionHeading(title));
  };

  const removeLegacyProjects = (section) => {
    section.querySelectorAll(":scope > .subsection-heading, :scope > .experiment-list").forEach((node) => node.remove());
  };

  const buildResumeEntry = (item) => {
    const copy = item.querySelector(".work-copy");
    const results = item.querySelector(".work-results");
    if (!copy || !results) return null;

    const role = copy.querySelector("h3")?.textContent?.trim();
    const organization = copy.querySelector(".work-context")?.textContent?.trim();
    const dates = copy.querySelector("time")?.textContent?.trim();
    const focus = copy.querySelector(".work-focus")?.textContent?.trim();
    const summary = copy.querySelector(".work-story")?.textContent?.trim();
    if (!role || !organization || !dates || !focus || !summary) return null;

    const article = element("article", "resume-entry");
    article.dataset.bladeTarget = "";

    const header = element("div", "resume-entry-header");
    const identity = element("div");
    identity.append(
      element("h3", "", role),
      element("p", "resume-entry-organization", organization),
    );
    header.append(identity, element("time", "", dates));

    const bullets = element("ul", "resume-entry-bullets");
    copy.querySelectorAll(".work-responsibilities li").forEach((detail) => {
      const text = detail.textContent?.trim();
      if (text) bullets.append(element("li", "", text));
    });

    const resultList = element("div", "resume-entry-results");
    resultList.setAttribute("aria-label", `${organization} results`);
    results.querySelectorAll(".result-row").forEach((row) => {
      const value = row.querySelector("strong")?.textContent?.trim();
      const label = row.querySelector("span")?.textContent?.trim();
      if (!value || !label) return;
      const result = element("div", "resume-result");
      result.append(element("strong", "", value), element("span", "", label));
      resultList.append(result);
    });

    article.append(
      header,
      element("p", "resume-entry-focus", focus),
      element("p", "resume-entry-summary", summary),
      bullets,
      resultList,
    );

    const originalLink = results.querySelector(".case-link");
    if (originalLink instanceof HTMLAnchorElement) {
      const link = element("a", "case-link resume-entry-link");
      link.href = originalLink.href;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.dataset.bladeTarget = "";
      const label = originalLink.textContent?.replace("↗", "").trim() || "View work";
      link.append(document.createTextNode(`${label} `), element("span", "", "↗"));
      article.append(link);
    }

    return article;
  };

  const flattenRoles = (section) => {
    const list = section.querySelector(":scope > .work-list, :scope > .resume-list");
    if (!list || list.classList.contains("resume-list")) return;

    const replacement = element("div", "resume-list");
    list.querySelectorAll(":scope > .work-item").forEach((item) => {
      const entry = buildResumeEntry(item);
      if (entry) replacement.append(entry);
    });
    list.replaceWith(replacement);
  };

  const buildProject = (project) => {
    const article = element("article", "resume-project");
    article.dataset.bladeTarget = "";

    const header = element("div", "resume-project-header");
    const identity = element("div");
    identity.append(element("h3", "", project.title), element("p", "", project.role));

    const link = element("a", "case-link resume-project-link");
    link.href = project.href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.dataset.bladeTarget = "";
    link.append(document.createTextNode(`${project.linkLabel} `), element("span", "", "↗"));
    header.append(identity, link);

    const bullets = element("ul", "resume-project-bullets");
    project.bullets.forEach((bullet) => bullets.append(element("li", "", bullet)));

    const meta = element("div", "resume-project-meta");
    meta.append(element("strong", "", project.impact), element("span", "", project.stack));

    article.append(
      header,
      element("p", "resume-project-summary", project.summary),
      bullets,
      meta,
    );
    return article;
  };

  const addProjects = (research) => {
    document.getElementById("case-studies")?.remove();
    if (document.getElementById("projects")) return;

    const section = element("section", "resume-projects-section resume-section");
    section.id = "projects";
    section.tabIndex = -1;
    section.append(buildSectionHeading("Selected Projects"));

    const list = element("div", "resume-project-list");
    projects.forEach((project) => list.append(buildProject(project)));
    section.append(list);
    research.after(section);
  };

  const updateNavigation = () => {
    const nav = document.querySelector(".site-header nav");
    if (!nav) return;
    const existingProjects = nav.querySelector('a[href="#projects"]');
    if (existingProjects) return;
    const replaceable = nav.querySelector('a[href="#case-studies"], a[href="#awards"]');
    if (!replaceable) return;
    replaceable.setAttribute("href", "#projects");
    replaceable.textContent = "Projects";
    replaceable.setAttribute("data-blade-target", "");
  };

  const simplifyAwardsAndSkills = () => {
    const awards = document.getElementById("awards");
    const columns = awards?.querySelectorAll(":scope > .about-column");
    if (!columns || columns.length < 2) return;

    const awardsColumn = columns[0];
    const awardsLabel = awardsColumn.querySelector(":scope > .section-label");
    if (awardsLabel) awardsLabel.replaceWith(element("h2", "about-heading", "Awards"));

    const skillsColumn = columns[1];
    if (skillsColumn.querySelector(".resume-skill-row")) return;
    skillsColumn.classList.add("technical-column");
    skillsColumn.replaceChildren(element("h2", "about-heading", "Skills"));
    skills.forEach(([title, list]) => {
      const row = element("div", "about-row skill-row resume-skill-row");
      row.append(element("h3", "", title), element("p", "skill-list", list));
      skillsColumn.append(row);
    });
  };

  const enhance = () => {
    if (!document.querySelector(".site-header.is-ready")) return false;
    const experience = document.getElementById("experience");
    const research = document.getElementById("research");
    if (!experience || !research) return false;

    experience.classList.add("resume-section");
    research.classList.add("resume-section");
    replaceSectionHeading(experience, "Experience");
    replaceSectionHeading(research, "Research");
    removeLegacyProjects(experience);
    removeLegacyProjects(research);
    flattenRoles(experience);
    flattenRoles(research);
    addProjects(research);
    simplifyAwardsAndSkills();
    updateNavigation();
    document.documentElement.dataset.resumeRefined = "true";
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
