document.addEventListener("DOMContentLoaded", () => {
  createSearch({
    inputSelector: "#constSearch",
    resultsSelector: "#constResults",
    getItems: () => document.querySelectorAll(".article-card"),
    matchItem: (article, value) => article.innerText.toLowerCase().includes(value),
    renderResult: (article) => {
      const title = article.querySelector("h3").innerText;
      const text = article.querySelector("p").innerText;
      return renderSearchResult(title, text);
    },
    onResultClick: (article, { input, results }) => {
      openParentAccordion(article, ".accordion");
      clearSearch(input, results);
      highlightAndScroll(article, "article-highlight");
    },
  });

  const params = new URLSearchParams(window.location.search);
  const artigoId = params.get("artigo");

  if (artigoId) {
    setTimeout(() => {
      const article = document.querySelector(`[data-article-id="${artigoId}"]`);

      if (article) {
        openParentAccordion(article, ".accordion");
        highlightAndScroll(article, "article-highlight");
      }
    }, 300);
  }
});
