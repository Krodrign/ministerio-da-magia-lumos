const revealItems = document.querySelectorAll('.fade-up');

const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.9;

  revealItems.forEach(item => {
    const top = item.getBoundingClientRect().top;

    if (top < trigger) {
      item.classList.add('show');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();function createParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';

  for (let i = 0; i < 35; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particlesContainer.appendChild(particle);
  }

  document.body.appendChild(particlesContainer);
}

document.addEventListener('DOMContentLoaded', createParticles);