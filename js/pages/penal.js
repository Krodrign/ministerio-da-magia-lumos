document.addEventListener("DOMContentLoaded", () => {
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
      const header = card.querySelector(".crime-header h3")?.innerText || "";
      const text = card.querySelector("p")?.innerText || "";
      return `${header} ${text}`.toLowerCase().includes(value);
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
