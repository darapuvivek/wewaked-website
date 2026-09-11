import './style.css';

const copyButton = document.querySelector('.copy-address');
const address = '101, Jana Jeeva Silver Palm Apartment, Haralur Road';

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(address);
  copyButton.textContent = 'Address copied';

  window.setTimeout(() => {
    copyButton.textContent = 'Copy address';
  }, 1800);
});
