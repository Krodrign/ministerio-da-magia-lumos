(function (global) {
  function renderParagraphs(paragraphs = []) {
    return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }

  function createArticle(article, articleClass) {
    const articleElement = document.createElement("article");
    articleElement.className = articleClass;

    if (article.id) {
      articleElement.dataset.articleId = article.id;
    }

    articleElement.innerHTML = `
      <h3>${article.titulo}</h3>
      ${renderParagraphs(article.paragrafos)}
    `;

    return articleElement;
  }

  function createAccordion(section, options) {
    const accordion = document.createElement("div");
    accordion.className = options.accordionClass;

    accordion.innerHTML = `
      <button class="${options.headerClass}" type="button">${section.titulo}</button>
      <div class="${options.contentClass}"></div>
    `;

    const content = accordion.querySelector(`.${options.contentClass}`);
    section.artigos.forEach((article) => {
      content.appendChild(createArticle(article, options.articleClass));
    });

    return accordion;
  }

  function refreshAccordion(selector) {
    if (global.AccordionManager?.instances) {
      global.AccordionManager.instances.delete(selector);
    }

    if (global.AccordionManager) {
      new global.AccordionManager(selector);
    }
  }

  function renderArticleAccordions({
    containerSelector,
    sections,
    articleClass,
    accordionClass = "accordion",
    accordionSelector = ".accordion",
    headerClass = "accordion-header",
    contentClass = "accordion-content",
  }) {
    const container = document.querySelector(containerSelector);

    if (!container || !Array.isArray(sections) || sections.length === 0) {
      return null;
    }

    const fragment = document.createDocumentFragment();
    sections.forEach((section) => {
      fragment.appendChild(
        createAccordion(section, {
          accordionClass,
          articleClass,
          headerClass,
          contentClass,
        }),
      );
    });

    container.replaceChildren(fragment);
    refreshAccordion(accordionSelector);

    return container;
  }

  global.LegalRenderer = {
    renderArticleAccordions,
  };
})(window);
