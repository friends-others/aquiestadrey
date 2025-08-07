// ===== DREYMAR PORTFOLIO - JAVASCRIPT =====

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

// Initialize all portfolio functionality
function initializePortfolio() {
    initSmoothScrolling();
    initImageLazyLoading();
    initScrollAnimations();
    initSocialLinksTracking();
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
    // Already handled by CSS scroll-behavior: smooth
    console.log('Smooth scrolling initialized');
}

// ===== LAZY LOADING IMAGES =====
function initImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe sections for animation
        const animatableElements = document.querySelectorAll('section');
        animatableElements.forEach(el => {
            animationObserver.observe(el);
        });
    }
}

// ===== SOCIAL LINKS TRACKING =====
function initSocialLinksTracking() {
    const socialLinks = document.querySelectorAll('.hero__social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const platform = this.href.includes('instagram') ? 'Instagram' : 'WhatsApp';
            console.log(`Social link clicked: ${platform}`);
            
            // Add a small animation feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// ===== EMAIL LINK FUNCTIONALITY =====
function initEmailFunctionality() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Email link clicked');
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// ===== GALLERY INTERACTIONS =====
function initGalleryInteractions() {
    const galleryImages = document.querySelectorAll('.gallery__image, .ugc-gallery__image');
    
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            // Simple lightbox functionality can be added here
            console.log('Gallery image clicked:', this.src);
        });
    });
}

// ===== RESPONSIVE NAVIGATION (if needed in future) =====
function initResponsiveNavigation() {
    // Placeholder for future navigation features
    console.log('Navigation system ready');
}

// ===== CONTACT FORM HANDLING (if added in future) =====
function initContactForm() {
    const contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Contact form submitted');
            // Handle form submission logic here
        });
    }
}

// ===== UTILITY FUNCTIONS =====

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== INITIALIZATION CALLS =====
// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initEmailFunctionality();
    initGalleryInteractions();
    initResponsiveNavigation();
    initContactForm();
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Optimize scroll events
window.addEventListener('scroll', throttle(function() {
    // Handle scroll-based interactions here if needed
}, 100));

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.log('JavaScript error occurred:', e.error);
});

// ===== CONSOLE BRANDING =====
console.log(`
🎨 Dreymar Portfolio
📧 drcarolugc@gmail.com
🌍 Colombia
✨ UGC Creator Portfolio
`);

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializePortfolio,
        debounce,
        throttle
    };
}