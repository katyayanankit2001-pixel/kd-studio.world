/**
 * KING DETAILING STUDIO — LUXURY AUTOMOTIVE CARE
 * Vanilla JavaScript (No Frameworks, No External Libraries)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.site-header');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile navigation toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    const toggleMenu = () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('active');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    };

    mobileToggle.addEventListener('click', toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Smooth scrolling for internal anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 4. Booking Form Validation & Submission
  const bookingForm = document.getElementById('bookingForm');
  const formSuccessBox = document.getElementById('formSuccessBox');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('fullName');
      const phoneInput = document.getElementById('phoneNumber');
      const emailInput = document.getElementById('emailAddress');
      const carInput = document.getElementById('carModel');

      let isValid = true;

      // Helper function to set error
      const setError = (input, msgId, message) => {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        const errorEl = document.getElementById(msgId);
        if (errorEl) {
          errorEl.textContent = message;
          errorEl.classList.add('visible');
        }
        isValid = false;
      };

      // Helper function to clear error
      const clearError = (input, msgId) => {
        input.classList.remove('input-error');
        input.setAttribute('aria-invalid', 'false');
        const errorEl = document.getElementById(msgId);
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('visible');
        }
      };

      // Validate Full Name
      const nameVal = nameInput.value.trim();
      if (!nameVal || nameVal.length < 2) {
        setError(nameInput, 'nameError', 'Please enter your full name.');
      } else {
        clearError(nameInput, 'nameError');
      }

      // Validate Phone Number
      const phoneVal = phoneInput.value.trim();
      const phoneRegex = /^[0-9+()\s-]{7,15}$/;
      if (!phoneVal || !phoneRegex.test(phoneVal)) {
        setError(phoneInput, 'phoneError', 'Please enter a valid phone number.');
      } else {
        clearError(phoneInput, 'phoneError');
      }

      // Validate Email
      const emailVal = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        setError(emailInput, 'emailError', 'Please enter a valid email address.');
      } else {
        clearError(emailInput, 'emailError');
      }

      // Validate Car Model
      const carVal = carInput.value.trim();
      if (!carVal || carVal.length < 2) {
        setError(carInput, 'carError', 'Please enter your vehicle make and model.');
      } else {
        clearError(carInput, 'carError');
      }

      if (isValid) {
        // Form is successfully validated
        const clientName = nameVal;
        const clientCar = carVal;

        // Hide form inputs or reset
        bookingForm.reset();

        // Show clean luxury success confirmation
        if (formSuccessBox) {
          formSuccessBox.innerHTML = `
            <h3 class="form-success-heading">Visit Request Received</h3>
            <p class="form-success-text">
              Thank you, <strong>${clientName}</strong>. Your consultation request for your <strong>${clientCar}</strong> has been received.<br>
              Our studio specialist will contact you shortly to confirm your preferred schedule.
            </p>
          `;
          formSuccessBox.classList.add('visible');
        }

        // Scroll smoothly to success box
        formSuccessBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Real-time input error clearing on user typing
    const inputs = bookingForm.querySelectorAll('.form-input');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        input.setAttribute('aria-invalid', 'false');
        const errorId = input.id.replace('fullName', 'nameError')
                                .replace('phoneNumber', 'phoneError')
                                .replace('emailAddress', 'emailError')
                                .replace('carModel', 'carError');
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('visible');
        }
      });
    });
  }

  // 5. IntersectionObserver for Premium Fade-In-Up on all .reveal-on-scroll elements
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px 40px 0px'
      }
    );

    revealElements.forEach((el) => {
      // Immediate reveal if already inside viewport on page load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('revealed');
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // 6. Desktop Cursor Parallax Animation in Hero Section
  const heroSection = document.getElementById('hero');
  const heroBg = document.getElementById('heroBgImage') || document.querySelector('.hero-bg-image');
  if (heroSection && heroBg && window.matchMedia('(pointer: fine)').matches) {
    let ticking = false;
    heroSection.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = heroSection.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          
          heroBg.style.transform = `scale(1.03) translate(${relX * -12}px, ${relY * -8}px)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      heroBg.style.transform = 'scale(1.02) translate(0px, 0px)';
    });
  }
});
