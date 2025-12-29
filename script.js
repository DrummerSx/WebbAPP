let score = parseInt(localStorage.getItem('astroClickerScore')) || 0;
const scoreElement = document.getElementById('score');
const planetElement = document.getElementById('planet');
const particlesContainer = document.getElementById('particles');

scoreElement.textContent = score;

planetElement.addEventListener('click', () => {
  score += 1;
  scoreElement.textContent = score;
  localStorage.setItem('astroClickerScore', score);

  // Анимация
  createParticle();

  // Кратковременная визуальная обратная связь
  planetElement.style.transform = 'scale(0.9)';
  setTimeout(() => {
    planetElement.style.transform = 'scale(1)';
  }, 100);
});

function createParticle() {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  particle.textContent = '+1'; // Можно заменить на ✨ или 🌟
  particle.style.position = 'absolute';
  particle.style.left = `${planetElement.getBoundingClientRect().left + 90}px`;
  particle.style.top = `${planetElement.getBoundingClientRect().top + 90}px`;
  particle.style.color = '#ffcc00';
  particle.style.fontSize = '20px';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '20';
  particle.style.opacity = '1';
  particle.style.transition = 'all 1s ease-out';

  particlesContainer.appendChild(particle);

  // Анимация полёта вверх и исчезновения
  setTimeout(() => {
    particle.style.transform = 'translateY(-50px)';
    particle.style.opacity = '0';
  }, 10);

  // Удалить элемент после анимации
  setTimeout(() => {
    particle.remove();
  }, 1000);
}