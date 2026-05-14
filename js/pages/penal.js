document.addEventListener("DOMContentLoaded", () => {
  const levelConfig = {
    leve: {
      accordionClass: "light",
      label: "BAIXA OFENSIVIDADE",
      title: "INFRAÇÕES LEVES",
      description:
        "Condutas de menor gravidade, normalmente resolvidas com advertência, multa baixa ou serviço comunitário.",
    },
    moderada: {
      accordionClass: "moderate",
      label: "RISCO MODERADO",
      title: "INFRAÇÕES MODERADAS",
      description:
        "Condutas com dano relevante, reincidência ou risco moderado à ordem pública e às normas ministeriais.",
    },
    grave: {
      accordionClass: "grave",
      label: "ALTA PERICULOSIDADE",
      title: "INFRAÇÕES GRAVES",
      description:
        "Condutas capazes de comprometer instituições, segurança coletiva, o Véu ou a estabilidade do mundo mágico.",
    },
    imperdoavel: {
      accordionClass: "unforgivable",
      label: "MEDIDAS EXTREMAS",
      title: "INFRAÇÕES IMPERDOÁVEIS",
      description:
        "Condutas de gravidade extrema, sujeitas a Azkaban, prisão perpétua ou medidas excepcionais.",
    },
  };

  function formatSicles(value) {
    return `${new Intl.NumberFormat("pt-BR").format(value)} sicles`;
  }

  function formatPenalty(crime) {
    if (crime.nivel === "imperdoavel") return "Perpétua";
    return `${crime.pena} meses`;
  }

  function formatFine(crime) {
    if (crime.nivel === "imperdoavel") return "Azkaban";
    return formatSicles(crime.multa);
  }

  function renderGeneralAccordions() {
    window.LegalRenderer?.renderArticleAccordions({
      containerSelector: ".penal-list",
      sections: window.PENAL_GENERAL || [],
      articleClass: "penal-article",
      accordionClass: "accordion fade-up show",
    });
  }

  function createCrimeCard(crime, config) {
    const card = document.createElement("article");
    card.className = `crime-card ${config.accordionClass} fade-up show`;

    card.innerHTML = `
      <div class="crime-header">
        <div>
          <div class="crime-meta">
            <span class="crime-article">${crime.artigo}</span>
            <span class="crime-level">${config.label.replace("INFRAÇÕES ", "")}</span>
          </div>
          <h3>${crime.nome}</h3>
        </div>

        <strong>${formatPenalty(crime)}</strong>
      </div>

      <p>${crime.descricao}</p>

      <div class="crime-footer">
        <span>${formatFine(crime)}</span>
        <span>${crime.conversao}</span>
      </div>
    `;

    return card;
  }

  function createCrimeAccordion(level, crimes) {
    const config = levelConfig[level];
    const accordion = document.createElement("div");
    accordion.className = `crime-accordion ${config.accordionClass} fade-up show`;

    accordion.innerHTML = `
      <button class="crime-accordion-header" type="button">
        <div>
          <span>${config.label}</span>
          <h3>${config.title}</h3>
          <p>${config.description}</p>
        </div>
      </button>

      <div class="crime-accordion-content">
        <div class="crime-grid"></div>
      </div>
    `;

    const grid = accordion.querySelector(".crime-grid");
    crimes
      .filter((crime) => crime.nivel === level)
      .forEach((crime) => {
        grid.appendChild(createCrimeCard(crime, config));
      });

    return accordion;
  }

  function renderCrimeAccordions() {
    const crimes = window.PENAL_CRIMES || [];
    const accordionList = document.querySelector(".crime-accordion-list");

    if (!accordionList || crimes.length === 0) return;

    accordionList.innerHTML = "";
    Object.keys(levelConfig).forEach((level) => {
      accordionList.appendChild(createCrimeAccordion(level, crimes));
    });

    if (typeof AccordionManager !== "undefined" && AccordionManager.instances) {
      AccordionManager.instances.delete(".crime-accordion");
    }

    new AccordionManager(".crime-accordion");
  }

  renderGeneralAccordions();
  renderCrimeAccordions();

  createSearch({
    inputSelector: "#penalBook1Search",
    resultsSelector: "#penalBook1Results",
    getItems: () => document.querySelectorAll(".cp-intro .penal-article"),
    matchItem: (article, value) => article.innerText.toLowerCase().includes(value),
    renderResult: (article) => {
      const title = article.querySelector("h3").innerText;
      const text = article.querySelector("p").innerText;
      return renderSearchResult(title, text);
    },
    onResultClick: (article, { input, results }) => {
      openParentAccordion(article, ".accordion");
      clearSearch(input, results);
      highlightAndScroll(article);
    },
  });

  createSearch({
    inputSelector: "#penalBook2Search",
    resultsSelector: "#penalBook2Results",
    getItems: () => document.querySelectorAll(".crime-card"),
    matchItem: (card, value) => {
      return card.innerText.toLowerCase().includes(value);
    },
    renderResult: (card) => {
      const title = card.querySelector(".crime-header h3").innerText;
      const text = card.querySelector("p").innerText;
      return renderSearchResult(title, text);
    },
    onResultClick: (card, { input, results }) => {
      const accordion = openParentAccordion(card, ".crime-accordion");
      if (accordion) {
        accordion.classList.add("highlighted");
        setTimeout(() => accordion.classList.remove("highlighted"), 2200);
      }

      clearSearch(input, results);
      highlightAndScroll(card);
    },
  });
});
