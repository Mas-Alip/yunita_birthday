// main.js
// Handles invitation interaction, countdown timer, scroll reveals, gallery lightbox, gift modal, and Phase 4 Firebase integration.

import { FirebaseService } from './firebase.js';

window.addEventListener('DOMContentLoaded', function () {
  const loader = document.getElementById('loader');
  const openButton = document.getElementById('open-invitation');
  const heroSection = document.getElementById('hero');
  const countdownMessage = document.getElementById('countdown-message');
  const countdownElements = {
    days: document.getElementById('countdown-days'),
    hours: document.getElementById('countdown-hours'),
    minutes: document.getElementById('countdown-minutes'),
    seconds: document.getElementById('countdown-seconds'),
  };
  const musicButton = document.getElementById('music-player');
  const audio = document.getElementById('birthday-audio');
  const giftCard = document.getElementById('gift-card');
  const giftModal = document.getElementById('gift-modal');
  const giftModalClose = document.getElementById('gift-modal-close');
  const closeModalButton = document.getElementById('close-modal');
  const copyButton = document.getElementById('copy-account');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxOverlay = document.getElementById('gallery-lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryImageMap = {
    image1: 'assets/images/Image_1.jpeg',
    image2: 'assets/images/Image_2.jpeg',
    image3: 'assets/images/Image_3.jpeg',
    image4: 'assets/images/Image_4.jpeg',
    image5: 'assets/images/Image_5.jpeg',
    image6: 'assets/images/Image_6.jpeg',
  };
  const celebrateButton = document.getElementById('celebrate-button');
  const decorationElements = document.querySelectorAll('.decor');
  
  // Phase 4: Wishes, RSVP, Share, Counter
  const wishesForm = document.getElementById('wishes-form');
  const guestbookList = document.getElementById('guestbook-list');
  const rsvpButtons = document.querySelectorAll('.rsvp-option');
  const shareButton = document.getElementById('share-button');
  const copyLinkButton = document.getElementById('copy-link-button');
  const visitorCounter = document.getElementById('visitor-counter');
  const countGoing = document.getElementById('count-going');
  const countMaybe = document.getElementById('count-maybe');
  const countDeclined = document.getElementById('count-declined');
  const toast = document.getElementById('toast-notification');
  const EVENT_DATE = new Date('2026-06-25T12:00:00Z');
  const EVENT_LABEL = 'June 27, 2026 · 18:00 WIB';

  let scrollPosition = 0;
  let currentRSVPStatus = localStorage.getItem('birthday-rsvp-status');
  const visitorId = getOrCreateVisitorId();

  function hideLoader() {
    if (!loader) return;
    setTimeout(function () {
      loader.style.animation = 'loaderFade 0.8s ease forwards';
      loader.addEventListener('animationend', function () {
        loader.style.display = 'none';
      });
    }, 650);
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function animateValue(element) {
    if (!element) return;
    element.classList.add('pulse');
    window.setTimeout(function () {
      element.classList.remove('pulse');
    }, 250);
  }

  function updateCountdown() {
    const now = new Date();
    const diff = EVENT_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      if (countdownMessage) {
        countdownMessage.textContent = 'The Celebration Has Started! 🎉';
      }
      Object.values(countdownElements).forEach((el) => {
        if (el) el.textContent = '00';
      });
      return false;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const days = Math.floor(totalSeconds / 86400);

    if (countdownElements.days) {
      countdownElements.days.textContent = pad(days);
      animateValue(countdownElements.days);
    }
    if (countdownElements.hours) {
      countdownElements.hours.textContent = pad(hours);
      animateValue(countdownElements.hours);
    }
    if (countdownElements.minutes) {
      countdownElements.minutes.textContent = pad(minutes);
      animateValue(countdownElements.minutes);
    }
    if (countdownElements.seconds) {
      countdownElements.seconds.textContent = pad(seconds);
      animateValue(countdownElements.seconds);
    }

    if (countdownMessage) {
      countdownMessage.textContent = EVENT_LABEL;
    }

    return true;
  }

  function initCountdown() {
    if (!countdownElements.days || !countdownElements.hours || !countdownElements.minutes || !countdownElements.seconds) {
      return;
    }

    const interval = window.setInterval(function () {
      if (!updateCountdown()) {
        clearInterval(interval);
      }
    }, 1000);

    updateCountdown();
  }

  function handleMusicToggle() {
    if (!audio || !musicButton) return;

    if (audio.paused) {
      audio.play().catch(() => {
        // Autoplay may be blocked
      });
      musicButton.classList.add('is-playing');
      musicButton.setAttribute('aria-label', 'Pause birthday music');
    } else {
      audio.pause();
      musicButton.classList.remove('is-playing');
      musicButton.setAttribute('aria-label', 'Play birthday music');
    }
  }

  function initMusicPlayer() {
    if (!musicButton || !audio) return;

    musicButton.addEventListener('click', handleMusicToggle);

    audio.addEventListener('ended', function () {
      musicButton.classList.remove('is-playing');
      musicButton.setAttribute('aria-label', 'Play birthday music');
    });
  }

  function openLightbox(imageId) {
    if (!lightboxOverlay || !lightboxImage) return;
    const imageUrl = galleryImageMap[imageId] || galleryImageMap.image1;
    lightboxImage.setAttribute('aria-label', `Gallery image ${imageId}`);
    lightboxImage.innerHTML = `<img id="lightbox-img" src="${imageUrl}" alt="Gallery image ${imageId}" />`;
    lightboxOverlay.classList.add('active');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightboxOverlay) return;
    lightboxOverlay.classList.remove('active');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
  }

  function initGallery() {
    if (!galleryItems || galleryItems.length === 0 || !lightboxOverlay) return;

    galleryItems.forEach((item) => {
      item.addEventListener('click', function () {
        const imageId = item.getAttribute('data-image') || 'image';
        openLightbox(imageId);
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', function (event) {
      if (event.target === lightboxOverlay) {
        closeLightbox();
      }
    });
  }

  function openGiftModal() {
    if (!giftModal) return;
    giftModal.classList.add('active');
    giftModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeGiftModal() {
    if (!giftModal) return;
    giftModal.classList.remove('active');
    giftModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initGiftModal() {
    if (!giftCard || !giftModal || !giftModalClose || !closeModalButton) return;

    giftCard.addEventListener('click', openGiftModal);
    giftModalClose.addEventListener('click', closeGiftModal);
    closeModalButton.addEventListener('click', closeGiftModal);

    giftModal.addEventListener('click', function (event) {
      if (event.target === giftModal) {
        closeGiftModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeGiftModal();
        closeLightbox();
      }
    });

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        const account = '1234567890';
        navigator.clipboard.writeText(account).then(function () {
          copyButton.textContent = 'Copied!';
          setTimeout(function () {
            copyButton.textContent = 'Copy Account';
          }, 1600);
        });
      });
    }
  }

  function launchConfetti() {
    if (typeof confetti !== 'function') return;

    const end = Date.now() + 2400;
    const colors = ['#F8BBD9', '#FCE4EC', '#FFF9FB', '#E91E63'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  function initCelebrate() {
    if (!celebrateButton) return;
    celebrateButton.addEventListener('click', launchConfetti);
  }

  function updateParallax() {
    scrollPosition = window.scrollY;
    decorationElements.forEach(function (element, index) {
      const speed = 0.12 + index * 0.03;
      const offset = scrollPosition * speed;
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  function initParallax() {
    if (!decorationElements || decorationElements.length === 0) return;

    window.addEventListener('scroll', function () {
      requestAnimationFrame(updateParallax);
    });

    updateParallax();
  }

  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || revealElements.length === 0) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -120px 0px',
        threshold: 0.2,
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  // Phase 4: Wishes Form Handler
  function initWishesForm() {
    if (!wishesForm) return;

    wishesForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const nameInput = document.getElementById('wish-name');
      const messageInput = document.getElementById('wish-message');
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) {
        showToast('Please fill in all fields');
        return;
      }

      const submitBtn = wishesForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      FirebaseService.saveWish(name, message)
        .then(function () {
          wishesForm.reset();
          showToast('✓ Wish sent successfully!');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Wish';
        })
        .catch(function (error) {
          console.error('Error saving wish:', error);
          showToast('Failed to send wish. Try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Wish';
        });
    });
  }

  // Phase 4: Load Guest Book
  function initGuestBook() {
    if (!guestbookList) return;

    FirebaseService.getWishes(function (wishes) {
      if (!wishes || wishes.length === 0) {
        guestbookList.innerHTML = '<p class="empty-state">No wishes yet. Be the first to leave one!</p>';
        return;
      }

      guestbookList.innerHTML = '';
      wishes.forEach(function (wish) {
        const card = document.createElement('div');
        card.className = 'guestbook-card fade-in';
        card.innerHTML = `
          <p class="guestbook-name">${escapeHtml(wish.name)}</p>
          <p class="guestbook-message">${escapeHtml(wish.message)}</p>
          <p class="guestbook-timestamp">${getRelativeTime(wish.timestamp)}</p>
        `;
        guestbookList.appendChild(card);
      });
    });
  }

  // Phase 4: RSVP Handler
  function initRSVP() {
    if (!rsvpButtons || rsvpButtons.length === 0) return;

    rsvpButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const status = button.getAttribute('data-status');

        rsvpButtons.forEach((btn) => btn.classList.remove('selected'));
        button.classList.add('selected');

        localStorage.setItem('birthday-rsvp-status', status);

        FirebaseService.saveRSVP(visitorId, status)
          .then(function () {
            showToast('✓ RSVP updated!');
          })
          .catch(function (error) {
            console.error('Error saving RSVP:', error);
          });
      });
    });

    // Restore previous RSVP selection
    if (currentRSVPStatus) {
      const selectedButton = document.querySelector(`[data-status="${currentRSVPStatus}"]`);
      if (selectedButton) {
        selectedButton.classList.add('selected');
      }
    }
  }

  // Phase 4: Load RSVP Summary
  function initRSVPSummary() {
    FirebaseService.getRSVPSummary(function (summary) {
      if (countGoing) countGoing.textContent = summary.going;
      if (countMaybe) countMaybe.textContent = summary.maybe;
      if (countDeclined) countDeclined.textContent = summary.declined;
    });
  }

  // Phase 4: Share Functionality
  function initShare() {
    if (shareButton) {
      shareButton.addEventListener('click', function () {
        const url = window.location.href;
        const title = 'You\'re invited to Sophia\'s Birthday!';

        if (navigator.share) {
          navigator.share({
            title: title,
            text: 'Join me for my birthday celebration!',
            url: url,
          }).catch((err) => {
            console.log('Share failed:', err);
          });
        } else {
          // Fallback to WhatsApp
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
          window.open(whatsappUrl, '_blank');
        }
      });
    }

    if (copyLinkButton) {
      copyLinkButton.addEventListener('click', function () {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(function () {
          showToast('✓ Link copied!');
        }).catch(function () {
          showToast('Failed to copy link');
        });
      });
    }
  }

  // Phase 4: Visitor Counter
  function initVisitorCounter() {
    if (!visitorCounter) return;

    const sessionKey = 'birthday-session-counted';
    const alreadyCounted = sessionStorage.getItem(sessionKey) === 'true';

    if (!alreadyCounted) {
      FirebaseService.incrementVisitorCount()
        .then(() => {
          sessionStorage.setItem(sessionKey, 'true');
        })
        .catch((error) => {
          console.error('Visitor counter increment failed:', error);
        });
    }

    FirebaseService.getVisitorCount(function (count) {
      animateCountUp(visitorCounter, count);
    });
  }

  // Phase 4: Helper Functions
  function getOrCreateVisitorId() {
    let id = localStorage.getItem('birthday-visitor-id');
    if (!id) {
      id = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('birthday-visitor-id', id);
    }
    return id;
  }

  function animateCountUp(element, finalCount) {
    if (!element) return;

    let currentCount = 0;
    const increment = Math.ceil(finalCount / 30);
    const interval = setInterval(() => {
      currentCount += increment;
      if (currentCount >= finalCount) {
        currentCount = finalCount;
        clearInterval(interval);
      }
      element.textContent = currentCount;
    }, 30);
  }

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      toast.classList.remove('show');
      toast.setAttribute('aria-hidden', 'true');
    }, 3000);
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  function getRelativeTime(timestamp) {
    if (!timestamp) return 'just now';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }

  // Initialize all features
  hideLoader();
  initCountdown();
  initMusicPlayer();
  initGallery();
  initGiftModal();
  initCelebrate();
  initParallax();
  initRevealAnimations();
  
  // Phase 4 initialization
  initWishesForm();
  initGuestBook();
  initRSVP();
  initRSVPSummary();
  initShare();
  initVisitorCounter();

  if (openButton && heroSection) {
    openButton.addEventListener('click', function () {
      heroSection.scrollIntoView({ behavior: 'smooth' });
      openButton.classList.add('button-active');
      setTimeout(function () {
        openButton.classList.remove('button-active');
      }, 420);
    });
  }
});
