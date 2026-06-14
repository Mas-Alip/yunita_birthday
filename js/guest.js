// guest.js
// Guest personalization utilities for BirthdayBloom.

function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const rawName = params.get('to')?.trim() || '';
  const sanitizedName = rawName
    .replace(/</g, '')
    .replace(/>/g, '')
    .replace(/['"`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitizedName || 'Guest';
}

window.getGuestName = getGuestName;

(function () {
  const displayName = getGuestName();
  const coverNameElement = document.getElementById('guest-name');
  const heroNameElement = document.getElementById('hero-guest-name');
  const welcomeCard = document.getElementById('hero-welcome-card');

  if (coverNameElement) {
    coverNameElement.textContent = displayName;
  }

  if (heroNameElement) {
    heroNameElement.textContent = `Dear ${displayName} 🌸`;
  }

  if (welcomeCard) {
    welcomeCard.textContent = `Hello ${displayName}, thank you for taking the time to visit this invitation.`;
  }
})();
