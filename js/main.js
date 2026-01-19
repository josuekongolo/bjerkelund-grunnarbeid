/**
 * Bjerkelund Grunnarbeid - Main JavaScript
 * Groundwork Services in Asker & Hurum, Norway
 */

(function() {
    'use strict';

    // =====================================================
    // DOM Elements
    // =====================================================
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.querySelector('.form-message');

    // =====================================================
    // Mobile Navigation
    // =====================================================
    function initMobileNav() {
        if (!menuToggle || !mobileNav) return;

        menuToggle.addEventListener('click', function() {
            const isActive = menuToggle.classList.contains('menu-toggle--active');

            menuToggle.classList.toggle('menu-toggle--active');
            mobileNav.classList.toggle('mobile-nav--active');

            // Update ARIA attributes
            menuToggle.setAttribute('aria-expanded', !isActive);

            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? '' : 'hidden';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                closeMobileNav();
            }
        });

        // Close menu when clicking a link
        const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav__link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileNav();
            }
        });
    }

    function closeMobileNav() {
        if (!menuToggle || !mobileNav) return;

        menuToggle.classList.remove('menu-toggle--active');
        mobileNav.classList.remove('mobile-nav--active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // =====================================================
    // Header Scroll Effect
    // =====================================================
    function initHeaderScroll() {
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;

            if (scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    // =====================================================
    // Smooth Scroll for Anchor Links
    // =====================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // =====================================================
    // Contact Form Handling
    // =====================================================
    function initContactForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Validate form
            if (!validateForm(contactForm)) {
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sender...</span>';

            // Collect form data
            const formData = {
                name: contactForm.querySelector('[name="name"]').value.trim(),
                email: contactForm.querySelector('[name="email"]').value.trim(),
                phone: contactForm.querySelector('[name="phone"]').value.trim(),
                location: contactForm.querySelector('[name="location"]')?.value.trim() || '',
                projectType: contactForm.querySelector('[name="projectType"]').value,
                description: contactForm.querySelector('[name="description"]').value.trim(),
                wantSiteVisit: contactForm.querySelector('[name="siteVisit"]')?.checked || false
            };

            try {
                // Simulate form submission (replace with actual API call)
                await simulateFormSubmission(formData);

                // Show success message
                showFormMessage('success', 'Takk for henvendelsen! Jeg tar kontakt så snart som mulig, vanligvis samme dag eller neste arbeidsdag.');

                // Reset form
                contactForm.reset();

            } catch (error) {
                // Show error message
                showFormMessage('error', 'Beklager, noe gikk galt. Vennligst prøv igjen eller ring meg direkte.');
                console.error('Form submission error:', error);
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            removeFieldError(field);

            if (!field.value.trim()) {
                showFieldError(field, 'Dette feltet er påkrevd');
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                showFieldError(field, 'Vennligst oppgi en gyldig e-postadresse');
                isValid = false;
            } else if (field.name === 'phone' && !isValidPhone(field.value)) {
                showFieldError(field, 'Vennligst oppgi et gyldig telefonnummer');
                isValid = false;
            }
        });

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        // Allow Norwegian phone numbers with optional country code
        const phoneRegex = /^(\+47|0047)?[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/;
        const cleanPhone = phone.replace(/[\s-]/g, '');
        return cleanPhone.length >= 8 && cleanPhone.length <= 12;
    }

    function showFieldError(field, message) {
        field.classList.add('form-control--error');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #E53935; font-size: 0.875rem; margin-top: 0.25rem;';

        field.parentNode.appendChild(errorDiv);
    }

    function removeFieldError(field) {
        field.classList.remove('form-control--error');

        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    function showFormMessage(type, message) {
        if (!formMessage) return;

        formMessage.className = `form-message form-message--${type} active`;
        formMessage.textContent = message;

        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide message after 10 seconds for success
        if (type === 'success') {
            setTimeout(() => {
                formMessage.classList.remove('active');
            }, 10000);
        }
    }

    async function simulateFormSubmission(data) {
        // Simulate network delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // For demo purposes, always succeed
                // In production, replace with actual API call to Resend or similar
                console.log('Form submitted:', data);
                resolve({ success: true });
            }, 1500);
        });
    }

    // =====================================================
    // Scroll Animations
    // =====================================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in');

        if (animatedElements.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // =====================================================
    // Click-to-Call on Mobile
    // =====================================================
    function initClickToCall() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

        phoneLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Track call clicks (for analytics)
                if (typeof gtag === 'function') {
                    gtag('event', 'click', {
                        event_category: 'Contact',
                        event_label: 'Phone Call'
                    });
                }
            });
        });
    }

    // =====================================================
    // Active Navigation Link
    // =====================================================
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');

            // Check if current page matches the link
            if (currentPath.endsWith(linkPath) ||
                (linkPath === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/bjerkelund-grunnarbeid/')))) {
                link.classList.add('nav__link--active', 'mobile-nav__link--active');
            } else {
                link.classList.remove('nav__link--active', 'mobile-nav__link--active');
            }
        });
    }

    // =====================================================
    // Lazy Load Images
    // =====================================================
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');

        if (lazyImages.length === 0) return;

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // =====================================================
    // Service Cards Hover Effect (for touch devices)
    // =====================================================
    function initServiceCardTouch() {
        const serviceCards = document.querySelectorAll('.service-card');

        if ('ontouchstart' in window) {
            serviceCards.forEach(card => {
                card.addEventListener('touchstart', function() {
                    // Remove active class from other cards
                    serviceCards.forEach(c => c.classList.remove('touch-active'));
                    this.classList.add('touch-active');
                }, { passive: true });
            });

            // Remove active class when touching elsewhere
            document.addEventListener('touchstart', function(e) {
                if (!e.target.closest('.service-card')) {
                    serviceCards.forEach(card => card.classList.remove('touch-active'));
                }
            }, { passive: true });
        }
    }

    // =====================================================
    // Initialize Everything
    // =====================================================
    function init() {
        initMobileNav();
        initHeaderScroll();
        initSmoothScroll();
        initContactForm();
        initScrollAnimations();
        initClickToCall();
        setActiveNavLink();
        initLazyLoading();
        initServiceCardTouch();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
