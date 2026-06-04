// ===== CAROUSEL FUNCTIONALITY =====
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
let autoSlideInterval;

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

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Auto-rotate slides every 5 seconds
startAutoSlide();

// Add event listeners to carousel controls
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    });
}
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    });
}

// Pause autoplay on hover
const heroCarousel = document.querySelector('.hero-carousel');
if (heroCarousel) {
    heroCarousel.addEventListener('mouseenter', stopAutoSlide);
    heroCarousel.addEventListener('mouseleave', startAutoSlide);
}

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

// ===== MODAL FUNCTIONALITY =====
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${actions.map(action => `<button class="modal-btn ${action.class}">${action.text}</button>`).join('')}
                <button class="modal-btn modal-cancel">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button functionality
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Action button functionality
    actions.forEach((action, index) => {
        const buttons = modal.querySelectorAll('.modal-btn');
        buttons[index].addEventListener('click', action.callback);
    });
    
    return modal;
}

// ===== PACKAGE DETAIL MODAL =====
function showPackageDetails(packageName, packageDesc, price) {
    const content = `
        <h3>${packageName}</h3>
        <p>${packageDesc}</p>
        <div class="package-details-modal">
            <div class="detail-item">
                <strong>Price:</strong> <span class="price-highlight">$${price}</span> per person
            </div>
            <div class="detail-item">
                <strong>Best Season:</strong> July - September
            </div>
            <div class="detail-item">
                <strong>Group Size:</strong> 4-12 people
            </div>
            <div class="detail-item">
                <strong>Difficulty:</strong> Moderate
            </div>
        </div>
    `;
    
    createModal(packageName, content, [
        {
            text: '❤️ Add to Favorites',
            class: 'btn-favorite',
            callback: () => {
                if (!favorites.includes(packageName)) {
                    favorites.push(packageName);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    showNotification('Added to favorites!', 'success');
                } else {
                    showNotification('Already in favorites!', 'info');
                }
            }
        },
        {
            text: '📧 Request Quote',
            class: 'btn-primary',
            callback: () => {
                window.location.href = 'contact.html?package=' + encodeURIComponent(packageName);
            }
        }
    ]);
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== ADD ANIMATION STYLES =====
if (!document.getElementById('animation-styles')) {
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        @keyframes fadeInScale {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeInScale 0.3s ease;
        }
        
        .modal-content {
            background: white;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .modal-header h2 {
            margin: 0;
            color: #1a1a1a;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            transition: color 0.2s;
        }
        
        .modal-close:hover {
            color: #ff6b35;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .modal-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: bold;
        }
        
        .modal-btn.btn-primary {
            background: #ff6b35;
            color: white;
        }
        
        .modal-btn.btn-primary:hover {
            background: #ff5722;
            transform: translateY(-2px);
        }
        
        .modal-btn.btn-favorite {
            background: #e74c3c;
            color: white;
        }
        
        .modal-btn.btn-favorite:hover {
            background: #c0392b;
            transform: translateY(-2px);
        }
        
        .modal-btn.modal-cancel {
            background: #95a5a6;
            color: white;
        }
        
        .modal-btn.modal-cancel:hover {
            background: #7f8c8d;
        }
        
        .package-details-modal {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .detail-item {
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }
        
        .detail-item:last-child {
            border-bottom: none;
        }
        
        .price-highlight {
            color: #ff6b35;
            font-size: 1.2em;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

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
    lazyImages.forEach(img => {
        if (!img.hasAttribute('src')) {
            img.src = img.dataset.src;
        }
    });
}

// ===== PAGE LOAD ANIMATIONS =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ===== SCROLL PROGRESS BAR =====
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    }
});

// ===== CTA BUTTON FUNCTIONALITY =====
const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        showNotification('Let\'s plan your adventure! 🌍', 'info');
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            setTimeout(() => {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            window.location.href = 'contact.html';
        }
    });
});

// ===== BOOK NOW BUTTONS WITH MODAL =====
const bookButtons = document.querySelectorAll('.book-btn');
bookButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Get package info from parent card
        const card = button.closest('.package-card') || button.closest('.attraction-detail');
        if (card) {
            const title = card.querySelector('h3, h2')?.textContent || 'Book Package';
            const description = card.querySelector('.package-description, p')?.textContent || 'Contact us for more details';
            const priceText = card.querySelector('.price')?.textContent || 'Contact for price';
            
            showPackageDetails(title, description, priceText);
        } else {
            window.location.href = 'contact.html';
        }
    });
});

// ===== ENHANCED FORM VALIDATION =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value.trim();
        
        // Real-time validation
        if (!name) {
            showNotification('Please enter your name', 'error');
            document.getElementById('name').focus();
            return;
        }
        
        if (!email) {
            showNotification('Please enter your email', 'error');
            document.getElementById('email').focus();
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            document.getElementById('email').focus();
            return;
        }
        
        if (!subject) {
            showNotification('Please select a subject', 'error');
            return;
        }
        
        if (!message || message.length < 10) {
            showNotification('Please enter a message with at least 10 characters', 'error');
            return;
        }
        
        // Show success message
        showNotification('✅ Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
        
        // Log form data (in real scenario, send to server)
        console.log('Form submitted:', { name, email, subject, message });
        
        // Reset form
        contactForm.reset();
    });
    
    // Real-time email validation
    const contactEmailInput = document.getElementById('email');
    if (contactEmailInput) {
        contactEmailInput.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.style.borderColor = '#e74c3c';
                this.title = 'Invalid email format';
            } else {
                this.style.borderColor = '';
                this.title = '';
            }
        });
    }
}

// ===== NEWSLETTER SUBSCRIPTION =====
const subscribeBtn = document.querySelector('.subscribe-btn');
const emailInput = document.getElementById('emailInput');

if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
        if (!emailInput || !emailInput.value) {
            showNotification('Please enter your email address', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        showNotification('✅ Thank you for subscribing! Check your email for a confirmation.', 'success');
        console.log('Newsletter subscription:', emailInput.value);
        emailInput.value = '';
    });
}

// ===== TESTIMONIAL CAROUSEL =====
let testimonialIndex = 0;
const testimonials = document.querySelectorAll('.testimonial');

function rotateTestimonials() {
    if (testimonials.length > 0) {
        testimonials.forEach(t => t.style.display = 'none');
        testimonials[testimonialIndex % testimonials.length].style.display = 'block';
        testimonialIndex++;
    }
}

if (testimonials.length > 1) {
    rotateTestimonials();
    setInterval(rotateTestimonials, 5000);
}

// ===== SCROLL TO TOP BUTTON =====
function createScrollToTopButton() {
    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.innerHTML = '⬆️ TOP';
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        display: none;
        background: #ff6b35;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 50px;
        cursor: pointer;
        z-index: 999;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    

    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        btn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-3px)';
        btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    });
}

createScrollToTopButton();

// ===== TOUR COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        let current = 0;
        const increment = Math.ceil(target / 50);
        
        const updateCounter = () => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + '+';
            } else {
                counter.textContent = current;
                requestAnimationFrame(updateCounter);
            }
        };
        
        updateCounter();
    });
}

// Trigger animation when stats section is visible
const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer2.unobserve(entry.target);
        }
    });
});

const statsSection = document.querySelector('.cta-section');
if (statsSection) observer2.observe(statsSection);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // S key to scroll to services
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        const featured = document.querySelector('.featured-attractions');
        if (featured) featured.scrollIntoView({ behavior: 'smooth' });
    }
    
    // H key to scroll to top
    if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

// ===== CONSOLE LOG FOR DEBUGGING =====
console.log('G Tours Kenya Website Loaded Successfully');
console.log('Website features: Interactive carousel, responsive design, smooth scrolling, form validation, modals, favorites, animations');
console.log('Tip: Press H to go to top, S to see attractions');

// Add some fun Easter eggs
document.addEventListener('keydown', (e) => {
    if (e.key === 't' && e.ctrlKey) {
        console.log('🦁 Welcome to G Tours Kenya! 🦁');
        console.log('📍 Exploring Kenya\'s top attractions');
        console.log('🌍 Your African adventure awaits!');
    }
});
