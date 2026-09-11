import './style.css';

const scenes = [...document.querySelectorAll('.scene')];
const progress = [...document.querySelectorAll('.progress i')];
const count = document.querySelector('.scene-count');
const nextButtons = document.querySelectorAll('.next');
const previousButton = document.querySelector('.previous');
const restartButton = document.querySelector('.restart');
const copyButton = document.querySelector('.copy-address');
const foodButtons = document.querySelectorAll('[data-food]');
const foodStatus = document.querySelector('.food-status');
const address = '101, Jana Jeeva Silver Palm Apartment, Haralur Road';
let activeScene = 0;
let wheelLocked = false;

function goTo(sceneIndex) {
  activeScene = Math.max(0, Math.min(sceneIndex, scenes.length - 1));
  document.documentElement.style.setProperty('--scene', activeScene);
  scenes.forEach((scene, index) => scene.classList.toggle('is-active', index === activeScene));
  progress.forEach((item, index) => item.classList.toggle('is-complete', index <= activeScene));
  count.innerHTML = `0${activeScene + 1} <i>/</i> 05`;
  previousButton.disabled = activeScene === 0;
  document.querySelector('.controls .next').disabled = activeScene === scenes.length - 1;
}

nextButtons.forEach((button) => button.addEventListener('click', () => goTo(activeScene + 1)));
previousButton.addEventListener('click', () => goTo(activeScene - 1));
restartButton.addEventListener('click', () => goTo(0));

foodButtons.forEach((button) => {
  button.addEventListener('click', () => {
    foodButtons.forEach((option) => option.classList.toggle('is-picked', option === button));
    foodStatus.textContent = `${button.dataset.food} is in the running. Excellent choice.`;
  });
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(address);
    copyButton.textContent = 'Address copied';
  } catch {
    copyButton.textContent = 'Use directions link';
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') goTo(activeScene + 1);
  if (event.key === 'ArrowLeft') goTo(activeScene - 1);
});

window.addEventListener('wheel', (event) => {
  if (wheelLocked || Math.abs(event.deltaY) < 20) return;
  wheelLocked = true;
  goTo(activeScene + (event.deltaY > 0 ? 1 : -1));
  window.setTimeout(() => { wheelLocked = false; }, 650);
}, { passive: true });

goTo(0);
