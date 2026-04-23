// ===== CAROUSEL FUNCTIONALITY =====
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[n].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Auto-rotate slides every 5 seconds
setInterval(nextSlide, 5000);

// Add event listeners to carousel controls
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

if (nextBtn) nextBtn.addEventListener('click', nextSlide);
if (prevBtn) prevBtn.addEventListener('click', prevSlide);

// ===== NAVIGATION MENU =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu when link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Validate form
        if (!name || !email || !subject || !message) {
            showFormMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        console.log('Form submitted:', { name, email, subject, message });
        
        // Show success message
        showFormMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
        
        // Reset form
        contactForm.reset();
    });
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
}

// ===== NEWSLETTER SUBSCRIPTION =====
const emailInput = document.getElementById('emailInput');
const subscribeBtn = document.querySelector('.subscribe-btn');

if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
        const email = emailInput.value;
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        console.log('Newsletter subscription:', email);
        alert('Thank you for subscribing! Check your email for a confirmation.');
        emailInput.value = '';
    });
}

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== CTA BUTTON FUNCTIONALITY =====
const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Scroll to contact section or navigate
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = 'contact.html';
        }
    });
});

// ===== BOOK NOW BUTTONS =====
const bookButtons = document.querySelectorAll('.book-btn');
bookButtons.forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = 'contact.html';
    });
});

// ===== PACKAGE FINDER =====
const findBtn = document.querySelector('.find-btn');
if (findBtn) {
    findBtn.addEventListener('click', () => {
        const duration = document.getElementById('duration').value;
        const budget = document.getElementById('budget').value;
        const interests = document.getElementById('interests').value;
        
        console.log('Searching packages:', { duration, budget, interests });
        alert('Searching for packages matching your criteria. Our team will contact you shortly!');
    });
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Add animation class to elements
document.querySelectorAll('.service-card, .package-card, .reason-card, .team-member, .attraction-card').forEach(el => {
    observer.observe(el);
});

// ===== ACTIVE NAV LINK =====
window.addEventListener('load', () => {
    const currentPage = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// ===== FAQACCORDION =====
const faqItems = document.querySelectorAll('.faq-item h3');
faqItems.forEach(item => {
    item.addEventListener('click', () => {
        const parent = item.parentElement;
        const isOpen = parent.classList.contains('open');
        
        // Close all other items
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('open');
        });
        
        // Toggle current item
        if (!isOpen) {
            parent.classList.add('open');
        }
    });
});

// ===== UTILITY FUNCTIONS =====
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

// ===== RESPONSIVE MENU =====
const handleResize = debounce(() => {
    if (window.innerWidth > 768) {
        if (navMenu) navMenu.classList.remove('active');
    }
}, 250);

window.addEventListener('resize', handleResize);

// ===== LAZY LOADING SETUP =====
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== PAGE LOAD ANIMATIONS =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

// ===== CONSOLE LOG FOR DEBUGGING =====
console.log('TERIK Tours Kenya Website Loaded Successfully');
console.log('Website features: Interactive carousel, responsive design, smooth scrolling, form validation');

// Add some fun Easter eggs
document.addEventListener('keydown', (e) => {
    if (e.key === 't' && e.ctrlKey) {
        console.log('🦁 Welcome to TERIK Tours Kenya! 🦁');
        console.log('📍 Exploring Kenya\'s top attractions');
        console.log('🌍 Your African adventure awaits!');
    }
});
