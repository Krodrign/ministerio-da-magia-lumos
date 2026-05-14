class AccordionManager {
  static instances = new Map();

  constructor(selector = '.accordion') {
    if (AccordionManager.instances.has(selector)) {
      return AccordionManager.instances.get(selector);
    }

    this.selector = selector;
    this.init();

    AccordionManager.instances.set(selector, this);
  }

  init() {
    const buttons = document.querySelectorAll(`${this.selector}-header`);
    buttons.forEach(button => {
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');

      button.addEventListener('click', () => {
        this.toggleAccordion(button);
      });
    });
  }

  closeAllAccordions() {
    document.querySelectorAll(`${this.selector}-content`).forEach(content => {
      content.classList.remove('open');
      content.style.maxHeight = null;
      content.style.padding = '';
      content.style.opacity = '';
      content.style.transform = '';
    });

    document.querySelectorAll(`${this.selector}-header`).forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    });

    document.querySelectorAll(this.selector).forEach(accordion => {
      accordion.classList.remove('active');
    });

    document.querySelectorAll(`${this.selector}.highlighted, ${this.selector} .highlighted, ${this.selector} .article-highlight`).forEach(el => {
      el.classList.remove('highlighted');
      el.classList.remove('article-highlight');
    });
  }

  openAccordion(header, content) {
    const accordion = header.closest(this.selector);

    if (accordion) {
      accordion.classList.add('active');
    }

    header.classList.add('active');
    header.setAttribute('aria-expanded', 'true');
    content.classList.add('open');
    content.style.maxHeight = content.scrollHeight + 40 + 'px';
  }

  toggleAccordion(button) {
    const content = button.nextElementSibling;
    if (!content) return;

    const isOpen = content.classList.contains('open');

    this.closeAllAccordions();

    if (!isOpen) {
      this.openAccordion(button, content);
    }
  }
}

window.AccordionManager = AccordionManager;
document.addEventListener('DOMContentLoaded', () => {
  new AccordionManager('.accordion');  new AccordionManager('.crime-accordion');
});
