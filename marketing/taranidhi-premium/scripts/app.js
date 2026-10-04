/* ============================================================
   TARANIDHI PREMIUM LANDING PAGE — JAVASCRIPT
   Features: Dark Mode, Scroll Animations, Smooth Navigation
   ============================================================ */

// ============================================================
// 1. DARK MODE TOGGLE
// ============================================================

const themeToggle = document.querySelector('.theme-toggle');
const htmlElement = document.documentElement;

// Initialize theme from localStorage or system preference
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    // System prefers dark, don't set attribute (let CSS handle it)
  }
}

// Toggle theme
themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Listen to system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    // If user hasn't manually selected a theme, follow system preference
    htmlElement.removeAttribute('data-theme');
  }
});

initializeTheme();

// ============================================================
// 2. SCROLL ANIMATIONS
// ============================================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = getComputedStyle(entry.target).animation;
    }
  });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('[class*="card"], [class*="section-header"]').forEach(el => {
  observer.observe(el);
});

// ============================================================
// 3. SMOOTH SCROLL BEHAVIOR
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================================
// 4. HEADER STICKY EFFECTS
// ============================================================

const header = document.querySelector('.header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > 100) {
    header.style.boxShadow = 'var(--shadow-md)';
  } else {
    header.style.boxShadow = 'none';
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// ============================================================
// 5. PARALLAX EFFECT ON HERO
// ============================================================

const heroSection = document.querySelector('.hero');
const celestialSvg = document.querySelector('.celestial-svg');

window.addEventListener('scroll', () => {
  if (heroSection) {
    const scrollPos = window.pageYOffset;
    const heroBottom = heroSection.offsetHeight;

    if (scrollPos < heroBottom) {
      celestialSvg.style.transform = `translateY(${scrollPos * 0.5}px)`;
    }
  }
});

// ============================================================
// 6. CAPABILITY CARD HOVER EFFECTS
// ============================================================

document.querySelectorAll('.capability-card, .intelligence-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.background = `linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)`;
  });

  card.addEventListener('mouseleave', function() {
    this.style.background = '';
  });
});

// ============================================================
// 7. COUNTER ANIMATION (stats in hero)
// ============================================================

const animateCounter = (element, target, duration = 2000) => {
  let current = 0;
  const increment = target / (duration / 16);
  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
};

// Trigger counter animation when hero stats come into view
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      const number = entry.target.querySelector('.stat-number');
      const target = parseInt(number.textContent);
      animateCounter(number, target, 2000);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
  statsObserver.observe(stat);
});

// ============================================================
// 8. FORM VALIDATION (Contact Form - if added)
// ============================================================

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateForm = (formData) => {
  const errors = [];

  if (!formData.name || formData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!validateEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!formData.message || formData.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  return errors;
};

// ============================================================
// 9. MOBILE MENU TOGGLE (if needed)
// ============================================================

// Placeholder for mobile menu functionality
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Close any open mobile menu
    document.body.style.overflow = 'auto';
  });
});

// ============================================================
// 10. KEYBOARD NAVIGATION ENHANCEMENTS
// ============================================================

// Trap focus in modals (if any)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close modals if any
  }
});

// ============================================================
// 11. PERFORMANCE: LAZY LOAD IMAGES
// ============================================================

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================================
// 12. ANALYTICS & TRACKING (Placeholder)
// ============================================================

const trackEvent = (eventName, eventData = {}) => {
  if (window.gtag) {
    gtag('event', eventName, eventData);
  }
  // Add custom analytics if needed
};

// Track button clicks
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    trackEvent('button_click', {
      button_text: btn.textContent.trim(),
      button_class: btn.className
    });
  });
});

// ============================================================
// 13. SMOOTH SECTION TRANSITIONS
// ============================================================

const sections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

sections.forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  sectionObserver.observe(section);
});

// ============================================================
// 14. UTILITY: GET VIEWPORT INFO
// ============================================================

const getViewportInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  };
};

// ============================================================
// 15. INITIALIZATION
// ============================================================

console.log('TaraNidhi Premium Landing Page loaded successfully');
console.log('Viewport:', getViewportInfo());

// Ensure all animations are GPU-accelerated
document.documentElement.style.willChange = 'transform';

// Preload critical assets
const preloadCritical = () => {
  const fonts = [
    'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500&display=swap'
  ];

  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = font;
    document.head.appendChild(link);
  });
};

preloadCritical();
