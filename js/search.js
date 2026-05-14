(function (global) {
  class SearchController {
    constructor(options) {
      this.inputSelector = options.inputSelector;
      this.resultsSelector = options.resultsSelector;
      this.getItems = options.getItems;
      this.matchItem = options.matchItem;
      this.renderResult = options.renderResult;
      this.onResultClick = options.onResultClick;
      this.minLength = options.minLength ?? 2;
      this.noResultsMessage = options.noResultsMessage || "Nenhum resultado encontrado.";
    }

    init() {
      this.input = document.querySelector(this.inputSelector);
      this.results = document.querySelector(this.resultsSelector);

      if (
        !this.input ||
        !this.results ||
        typeof this.getItems !== "function" ||
        typeof this.matchItem !== "function" ||
        typeof this.renderResult !== "function" ||
        typeof this.onResultClick !== "function"
      ) {
        return null;
      }

      this.input.addEventListener("input", () => this.handleInput());
      return this;
    }

    clearResults() {
      this.results.replaceChildren();
    }

    handleInput() {
      const value = this.input.value.trim().toLowerCase();
      this.clearResults();

      if (value.length < this.minLength) {
        return;
      }

      const items = Array.from(this.getItems() || []);
      const found = items.filter((item) => this.matchItem(item, value));

      if (found.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "search-empty";
        emptyMessage.textContent = this.noResultsMessage;
        this.results.appendChild(emptyMessage);
        return;
      }

      found.forEach((item) => {
        const result = this.renderResult(item, value);
        result.addEventListener("click", () => {
          this.onResultClick(item, {
            input: this.input,
            results: this.results,
          });
        });
        this.results.appendChild(result);
      });
    }
  }

  function createSearch(options) {
    const controller = new SearchController(options);
    return controller.init();
  }

  function renderSearchResult(title, text) {
    const item = document.createElement("div");
    const resultTitle = document.createElement("strong");
    const resultText = document.createElement("span");

    item.className = "search-result-item";
    resultTitle.textContent = title;
    resultText.textContent = text;
    item.append(resultTitle, resultText);

    return item;
  }

  function clearSearch(input, results) {
    input.value = "";
    results.replaceChildren();
  }

  function openParentAccordion(target, selector) {
    const accordion = target.closest(selector);
    if (!accordion) return null;

    const header = accordion.querySelector(`${selector}-header`);
    const content = accordion.querySelector(`${selector}-content`);
    const accordionManager = new AccordionManager(selector);

    accordionManager.closeAllAccordions();
    accordionManager.openAccordion(header, content);

    return accordion;
  }

  function highlightAndScroll(target, className = "highlighted") {
    target.classList.add(className);

    setTimeout(() => {
      target.classList.remove(className);
    }, 2200);

    setTimeout(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
  }

  global.SearchController = SearchController;
  global.createSearch = createSearch;
  global.renderSearchResult = renderSearchResult;
  global.clearSearch = clearSearch;
  global.openParentAccordion = openParentAccordion;
  global.highlightAndScroll = highlightAndScroll;
})(window);
