// Accordion functionality
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
      button.addEventListener('click', () => {
        this.toggleAccordion(button);
      });
    });
  }

  closeAllAccordions() {
    document.querySelectorAll(`${this.selector}-content`).forEach(content => {
      content.classList.remove('open');
      content.style.maxHeight = null;
      content.style.padding = '0 22px';
      content.style.opacity = '0';
      content.style.transform = 'translateY(-8px)';
    });

    document.querySelectorAll(`${this.selector}-header`).forEach(button => {
      button.classList.remove('active');
    });

    document.querySelectorAll(`${this.selector}.highlighted, ${this.selector} .highlighted, ${this.selector} .article-highlight`).forEach(el => {
      el.classList.remove('highlighted');
      el.classList.remove('article-highlight');
    });
  }

  openAccordion(header, content) {
    header.classList.add('active');
    content.classList.add('open');
    content.style.padding = '22px';
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
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

// Initialize accordions
document.addEventListener('DOMContentLoaded', () => {
  // General accordions
  new AccordionManager('.accordion');

  // Crime accordions (specific for penal page)
  new AccordionManager('.crime-accordion');
});