// ===== CAROUSEL FUNCTIONALITY =====
let currentSlide = 0;
let slides = [];
let autoSlideInterval;

function showSlide(n) {
    if (!slides.length) return;
    slides.forEach(slide => slide.classList.remove('active'));
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function startAutoSlide() {
    stopAutoSlide();
    if (slides.length > 1) {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

function initializeHeroCarousel() {
    slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    currentSlide = 0;
    showSlide(0);
    startAutoSlide();
}

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

const AUTH_STORAGE_KEY = 'gToursGoogleAuth';
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

function getGoogleClientId() {
    return window.GOOGLE_AUTH_CONFIG?.clientId || '';
}

function escapeHtml(value) {
    if (!value) return '';
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    } catch (error) {
        return null;
    }
}

function saveUser(user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function mergeUserProfile(googleProfile, existing) {
    if (!existing || existing.sub !== googleProfile.sub) {
        return {
            ...googleProfile,
            phone: '',
            bio: ''
        };
    }

    return {
        ...googleProfile,
        name: existing.name || googleProfile.name,
        phone: existing.phone || '',
        bio: existing.bio || '',
        picture: existing.picture || googleProfile.picture
    };
}

function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

function updateAuthUI() {
    const user = getStoredUser();
    const userPill = document.getElementById('userPill');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');

    if (user && userPill && userAvatar && userName) {
        userPill.hidden = false;
        if (googleLoginBtn) googleLoginBtn.style.display = 'none';
        userAvatar.src = user.picture || '6596121.png';
        userAvatar.alt = user.name || 'User avatar';
        userAvatar.title = 'Edit your profile';
        userName.textContent = user.name || user.email || 'User';
        if (editProfileBtn) editProfileBtn.style.display = 'inline-flex';
        prefillAuthenticatedForms(user);
    } else {
        if (userPill) userPill.hidden = true;
        if (googleLoginBtn) googleLoginBtn.style.display = 'flex';
        if (editProfileBtn) editProfileBtn.style.display = 'none';
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => signOut();
    }

    if (editProfileBtn) {
        editProfileBtn.onclick = () => openProfileEditor();
    }

    if (userAvatar) {
        userAvatar.onclick = () => {
            if (getStoredUser()) openProfileEditor();
        };
    }
}

function prefillAuthenticatedForms(user) {
    const contactName = document.getElementById('name');
    const contactEmail = document.getElementById('email');
    const contactPhone = document.getElementById('phone');

    if (contactName && !contactName.value.trim()) {
        contactName.value = user.name || '';
    }
    if (contactEmail && !contactEmail.value.trim()) {
        contactEmail.value = user.email || '';
    }
    if (contactPhone && !contactPhone.value.trim() && user.phone) {
        contactPhone.value = user.phone;
    }
}

function signOut() {
    const user = getStoredUser();

    if (window.google?.accounts?.id) {
        google.accounts.id.disableAutoSelect();
        if (user?.email) {
            google.accounts.id.revoke(user.email, () => {});
        }
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    updateAuthUI();
    showNotification('You have been signed out.', 'info');
}

function saveProfileChanges(user, modal) {
    const updatedUser = {
        ...user,
        name: document.getElementById('profileName').value.trim() || user.name,
        phone: document.getElementById('profilePhone').value.trim(),
        bio: document.getElementById('profileBio').value.trim(),
        picture: document.getElementById('profilePhotoUrl').value.trim() || user.picture
    };

    saveUser(updatedUser);
    updateAuthUI();
    showNotification('Profile updated successfully.', 'success');
    modal.remove();
}

function openProfileEditor() {
    const user = getStoredUser();
    if (!user) {
        showNotification('Sign in with Google to edit your profile.', 'info');
        return;
    }

    const defaultAvatar = user.picture || '6596121.png';
    const content = `
        <form id="profileEditorForm" class="profile-editor-form">
            <div class="profile-avatar-preview">
                <img id="profilePreviewImage" src="${escapeHtml(defaultAvatar)}" alt="Profile preview">
                <p class="profile-avatar-hint">Upload a photo or paste an image URL</p>
            </div>
            <div class="profile-field-group">
                <label for="profileName">Full Name</label>
                <input type="text" id="profileName" value="${escapeHtml(user.name || '')}" maxlength="80" />
            </div>
            <div class="profile-field-group">
                <label for="profileEmail">Email</label>
                <input type="email" id="profileEmail" value="${escapeHtml(user.email || '')}" disabled />
                <small class="profile-field-note">Email is managed by your Google account</small>
            </div>
            <div class="profile-field-group">
                <label for="profilePhone">Phone</label>
                <input type="tel" id="profilePhone" value="${escapeHtml(user.phone || '')}" placeholder="Add your phone number" maxlength="20" />
            </div>
            <div class="profile-field-group">
                <label for="profileBio">Bio</label>
                <textarea id="profileBio" rows="3" maxlength="280" placeholder="Tell travelers a bit about yourself">${escapeHtml(user.bio || '')}</textarea>
            </div>
            <div class="profile-field-group">
                <label for="profilePhotoUrl">Profile Picture URL</label>
                <input type="url" id="profilePhotoUrl" value="${escapeHtml(user.picture && !user.picture.startsWith('data:') ? user.picture : '')}" placeholder="https://example.com/photo.jpg" />
            </div>
            <div class="profile-field-group">
                <label for="profilePhotoFile">Or upload an image</label>
                <input type="file" id="profilePhotoFile" accept="image/jpeg,image/png,image/webp,image/gif" />
                <small class="profile-field-note">Max size 2 MB. JPG, PNG, WebP, or GIF.</small>
            </div>
        </form>
    `;

    const modal = createModal('Edit Profile', content, [
        {
            text: 'Save Changes',
            class: 'btn-primary',
            callback: () => {
                const form = document.getElementById('profileEditorForm');
                if (!form) return;

                const fileInput = document.getElementById('profilePhotoFile');
                const selectedFile = fileInput?.files?.[0];

                if (selectedFile) {
                    if (selectedFile.size > MAX_PROFILE_IMAGE_BYTES) {
                        showNotification('Profile image must be 2 MB or smaller.', 'error');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const updatedUser = {
                            ...user,
                            name: document.getElementById('profileName').value.trim() || user.name,
                            phone: document.getElementById('profilePhone').value.trim(),
                            bio: document.getElementById('profileBio').value.trim(),
                            picture: e.target.result
                        };
                        saveUser(updatedUser);
                        updateAuthUI();
                        showNotification('Profile updated successfully.', 'success');
                        modal.remove();
                    };
                    reader.readAsDataURL(selectedFile);
                    return;
                }

                saveProfileChanges(user, modal);
            }
        }
    ]);

    const photoUrlInput = modal.querySelector('#profilePhotoUrl');
    const photoFileInput = modal.querySelector('#profilePhotoFile');
    const previewImage = modal.querySelector('#profilePreviewImage');

    if (photoUrlInput && previewImage) {
        photoUrlInput.addEventListener('input', () => {
            previewImage.src = photoUrlInput.value.trim() || defaultAvatar;
        });
    }

    if (photoFileInput && previewImage) {
        photoFileInput.addEventListener('change', () => {
            const file = photoFileInput.files?.[0];
            if (!file) return;

            if (file.size > MAX_PROFILE_IMAGE_BYTES) {
                showNotification('Profile image must be 2 MB or smaller.', 'error');
                photoFileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                if (photoUrlInput) {
                    photoUrlInput.value = '';
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

function handleCredentialResponse(response) {
    const payload = decodeJwtPayload(response.credential);
    if (!payload) {
        showNotification('Unable to read your Google profile.', 'error');
        return;
    }

    const googleProfile = {
        name: payload.name || payload.email,
        email: payload.email,
        picture: payload.picture || '',
        sub: payload.sub
    };

    const userProfile = mergeUserProfile(googleProfile, getStoredUser());
    saveUser(userProfile);
    updateAuthUI();
    showNotification(`Welcome, ${payload.given_name || payload.name}!`, 'success');
}

function initializeGoogleAuth(retryCount = 0) {
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (!googleLoginBtn) {
        return;
    }

    if (!window.google?.accounts?.id) {
        if (retryCount < 24) {
            setTimeout(() => initializeGoogleAuth(retryCount + 1), 250);
            return;
        }

        googleLoginBtn.innerHTML = '<span class="auth-warning">Could not load Google Sign-In. Check your connection.</span>';
        return;
    }

    const clientId = getGoogleClientId();
    if (!clientId || clientId.includes('YOUR_')) {
        googleLoginBtn.innerHTML = '<span class="auth-warning">Add your Google Client ID in auth-config.js to enable sign-in</span>';
        googleLoginBtn.style.pointerEvents = 'none';
        return;
    }

    google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        itp_support: true
    });

    googleLoginBtn.innerHTML = '';
    google.accounts.id.renderButton(googleLoginBtn, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left'
    });

    if (!getStoredUser()) {
        google.accounts.id.prompt();
    }
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

const DASHBOARD_STORAGE_KEY = 'gToursDashboardContent';
const ADMIN_STORAGE_KEY = 'gToursAdminContent';
const defaultDashboardContent = {
    siteName: 'G TOURS KENYA',
    attractionsHeaderTitle: "Kenya's Top Tourist Attractions",
    attractionsHeaderText: 'Explore the most stunning destinations in Kenya',
    safariHeaderTitle: 'Safari Tours & Packages',
    safariHeaderText: 'Choose from our expertly crafted safari experiences',
    aboutHeaderTitle: 'About G Tours Kenya',
    aboutHeaderText: 'Your Gateway to African Adventure Since 2010',
    contactHeaderTitle: 'Get In Touch',
    contactHeaderText: "Have questions? We'd love to hear from you!",
    heroTitle: 'Welcome to G Tours Kenya',
    heroSubtitle: 'Experience the Wonder of African Wildlife and the beauty of Kenyan landscapes',
    heroCta: 'Start Your Adventure',
    featuredTitle1: 'Masai Mara',
    featuredText1: 'Witness the Great Migration and encounter Africa\'s "Big Five"',
    featuredTitle2: 'Mount Kenya',
    featuredText2: 'Conquer East Africa\'s second-highest peak',
    featuredTitle3: 'Amboseli',
    featuredText3: 'Stunning views of Kilimanjaro with incredible wildlife',
    featuredTitle4: 'Tsavo',
    featuredText4: 'Africa\'s largest national park with red elephants',
    serviceTitle1: 'Wildlife Safari',
    serviceText1: 'Professional guided safari tours to encounter Africa\'s incredible wildlife',
    serviceTitle2: 'Camping Adventures',
    serviceText2: 'Experience the raw beauty of nature under the stars',
    serviceTitle3: 'Hiking Expeditions',
    serviceText3: 'Trek through mountains and valleys with expert guides',
    serviceTitle4: 'Photography Tours',
    serviceText4: 'Capture breathtaking moments with professional photography guides',
    serviceTitle5: 'Luxury Accommodations',
    serviceText5: 'Stay in premium lodges and resorts with world-class service',
    serviceTitle6: 'Family Packages',
    serviceText6: 'Create unforgettable memories with tailored family tours',
    serviceTitle7: 'Custom Itineraries',
    serviceText7: 'Design your dream safari of your preference with our expert travel planners',
    newsletterTitle: 'Stay Updated',
    newsletterText: 'Subscribe to our newsletter for exclusive deals and travel tips',
    footerDescription: 'Leading provider of authentic safari and adventure tours across Kenya.',
    footerLocation: 'Nairobi, Kenya',
    footerPhone: '+254 707 135 305',
    footerEmail: 'garethmarete11@gmail.com',
    heroSlides: [
        { title: 'LION', subtitle: 'King of the Savanna', image: 'walk.lion.jpg', alt: 'Lion on the savanna' },
        { title: 'ELEPHANT', subtitle: 'Gentle Giants of Africa', image: 'walking.rhinos.jpg', alt: 'Elephant herd in Kenya' },
        { title: 'GIRAFFE', subtitle: 'Nature\'s most Magnificent Tower', image: 'landscape.kenya.jpg', alt: 'Giraffe in the wild' }
    ],
    travelInsights: [
        { title: 'Plan Like a Pro', description: 'Learn when to visit, what to pack, and how to prepare for the Kenyan wilderness.', image: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=800&h=500&fit=crop', alt: 'Planning a safari' },
        { title: 'Cultural Immersion', description: 'Discover how local communities, traditions, and conservation are woven into every tour.', image: 'kenyan.culture.jpg', alt: 'Local cultural experience' },
        { title: 'Photography Tips', description: 'Get insider advice on capturing wildlife moments, landscapes, and unforgettable safari shots.', image: 'photo.kenya.jpg', alt: 'Wildlife photography guide' }
    ],
    featuredItems: [
        { title: 'Masai Mara', description: 'Witness the Great Migration and encounter Africa\'s "Big Five"' },
        { title: 'Mount Kenya', description: 'Conquer East Africa\'s second-highest peak' }
    ],
    servicesItems: [
        { title: 'Wildlife Safari', description: 'Professional guided safari tours to encounter Africa\'s incredible wildlife' }
    ]
};

function getDashboardContent() {
    try {
        const saved = localStorage.getItem(DASHBOARD_STORAGE_KEY);
        return saved ? { ...defaultDashboardContent, ...JSON.parse(saved) } : { ...defaultDashboardContent };
    } catch (error) {
        return { ...defaultDashboardContent };
    }
}

function saveDashboardContent(content) {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new CustomEvent('siteContentUpdated', { detail: content }));
}

function getAdminContent() {
    try {
        const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
        return saved ? JSON.parse(saved) : getDashboardContent();
    } catch (error) {
        return getDashboardContent();
    }
}

function saveAdminContent(content) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new CustomEvent('siteContentUpdated', { detail: content }));
}

function applyDashboardContent(content) {
    Object.entries(content).forEach(([key, value]) => {
        const element = document.querySelector(`[data-editable="${key}"]`);
        if (element) {
            element.textContent = value;
        }
    });

    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        const heroSlides = Array.isArray(content.heroSlides) && content.heroSlides.length > 0 ? content.heroSlides : defaultDashboardContent.heroSlides;
        heroCarousel.innerHTML = heroSlides.map((slide, index) => `
            <div class="hero-slide ${index === 0 ? 'active' : ''}">
                <img class="hero-slide-image" src="${escapeHtml(slide.image || 'walk.lion.jpg')}" alt="${escapeHtml(slide.alt || slide.title || 'Hero image')}" loading="lazy">
                <div class="hero-content">
                    <h2>${escapeHtml(slide.title || '')}</h2>
                    <p>${escapeHtml(slide.subtitle || '')}</p>
                </div>
            </div>
        `).join('');
        initializeHeroCarousel();
    }

    const featuredGrid = document.querySelector('.attractions-grid');
    if (featuredGrid) {
        const featuredItems = content.featuredItems || [
            { title: content.featuredTitle1 || 'Masai Mara', description: content.featuredText1 || 'Witness the Great Migration and encounter Africa\'s "Big Five"' },
            { title: content.featuredTitle2 || 'Mount Kenya', description: content.featuredText2 || 'Conquer East Africa\'s second-highest peak' },
            { title: content.featuredTitle3 || 'Amboseli', description: content.featuredText3 || 'Stunning views of Kilimanjaro with incredible wildlife' },
            { title: content.featuredTitle4 || 'Tsavo', description: content.featuredText4 || 'Africa\'s largest national park with red elephants' }
        ];

        featuredGrid.innerHTML = featuredItems.map((item, index) => `
            <div class="attraction-card" data-destination="item-${index}">
                <div class="attraction-image"><img class="responsive-img" src="mara safaris.jpg" alt="${escapeHtml(item.title || 'Destination')}" loading="lazy"></div>
                <h3>${escapeHtml(item.title || '')}</h3>
                <p>${escapeHtml(item.description || '')}</p>
                <button class="book-btn" style="margin: 10px; width: calc(100% - 20px);">Learn More</button>
            </div>
        `).join('');
    }

    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        const servicesItems = content.servicesItems || [
            { title: content.serviceTitle1 || 'Wildlife Safari', description: content.serviceText1 || 'Professional guided safari tours to encounter Africa\'s incredible wildlife' },
            { title: content.serviceTitle2 || 'Camping Adventures', description: content.serviceText2 || 'Experience the raw beauty of nature under the stars' },
            { title: content.serviceTitle3 || 'Hiking Expeditions', description: content.serviceText3 || 'Trek through mountains and valleys with expert guides' },
            { title: content.serviceTitle4 || 'Photography Tours', description: content.serviceText4 || 'Capture breathtaking moments with professional photography guides' },
            { title: content.serviceTitle5 || 'Luxury Accommodations', description: content.serviceText5 || 'Stay in premium lodges and resorts with world-class service' },
            { title: content.serviceTitle6 || 'Family Packages', description: content.serviceText6 || 'Create unforgettable memories with tailored family tours' },
            { title: content.serviceTitle7 || 'Custom Itineraries', description: content.serviceText7 || 'Design your dream safari of your preference with our expert travel planners' }
        ];

        servicesGrid.innerHTML = servicesItems.map(item => `
            <div class="service-card">
                <div class="service-icon"></div>
                <h3>${escapeHtml(item.title || '')}</h3>
                <p>${escapeHtml(item.description || '')}</p>
            </div>
        `).join('');
    }

    const insightsGrid = document.querySelector('.insights-grid');
    if (insightsGrid) {
        const insightsItems = Array.isArray(content.travelInsights) && content.travelInsights.length > 0 ? content.travelInsights : defaultDashboardContent.travelInsights;
        insightsGrid.innerHTML = insightsItems.map(item => `
            <article class="insight-card">
                <img class="responsive-img" src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.alt || item.title || 'Travel insight')}" loading="lazy">
                <h3>${escapeHtml(item.title || '')}</h3>
                <p>${escapeHtml(item.description || '')}</p>
            </article>
        `).join('');
    }

    if (content.siteName) {
        document.title = `${content.siteName} - G Tours Kenya`;
    }
}

function openDashboard() {
    const panel = document.getElementById('dashboardPanel');
    const backdrop = document.getElementById('dashboardBackdrop');
    if (!panel || !backdrop) return;

    const content = getDashboardContent();
    panel.innerHTML = `
        <h3>Website Dashboard</h3>
        <p>Update the homepage content here. Changes are saved in your browser and appear instantly.</p>
        <div class="dashboard-grid">
            <div class="dashboard-field">
                <label for="dashboardSiteName">Site name</label>
                <input id="dashboardSiteName" value="${escapeHtml(content.siteName || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardAttractionsHeaderTitle">Attractions page heading</label>
                <input id="dashboardAttractionsHeaderTitle" value="${escapeHtml(content.attractionsHeaderTitle || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardAttractionsHeaderText">Attractions page subtitle</label>
                <input id="dashboardAttractionsHeaderText" value="${escapeHtml(content.attractionsHeaderText || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardSafariHeaderTitle">Safari page heading</label>
                <input id="dashboardSafariHeaderTitle" value="${escapeHtml(content.safariHeaderTitle || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardSafariHeaderText">Safari page subtitle</label>
                <input id="dashboardSafariHeaderText" value="${escapeHtml(content.safariHeaderText || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardAboutHeaderTitle">About page heading</label>
                <input id="dashboardAboutHeaderTitle" value="${escapeHtml(content.aboutHeaderTitle || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardAboutHeaderText">About page subtitle</label>
                <input id="dashboardAboutHeaderText" value="${escapeHtml(content.aboutHeaderText || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardContactHeaderTitle">Contact page heading</label>
                <input id="dashboardContactHeaderTitle" value="${escapeHtml(content.contactHeaderTitle || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardContactHeaderText">Contact page subtitle</label>
                <input id="dashboardContactHeaderText" value="${escapeHtml(content.contactHeaderText || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardHeroTitle">Hero title</label>
                <input id="dashboardHeroTitle" value="${escapeHtml(content.heroTitle || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardHeroSubtitle">Hero subtitle</label>
                <textarea id="dashboardHeroSubtitle" rows="2">${escapeHtml(content.heroSubtitle || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardHeroCta">Hero button</label>
                <input id="dashboardHeroCta" value="${escapeHtml(content.heroCta || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedTitle1">Featured destination 1</label>
                <input id="dashboardFeaturedTitle1" value="${escapeHtml(content.featuredTitle1 || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedText1">Featured description 1</label>
                <textarea id="dashboardFeaturedText1" rows="2">${escapeHtml(content.featuredText1 || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedTitle2">Featured destination 2</label>
                <input id="dashboardFeaturedTitle2" value="${escapeHtml(content.featuredTitle2 || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedText2">Featured description 2</label>
                <textarea id="dashboardFeaturedText2" rows="2">${escapeHtml(content.featuredText2 || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedTitle3">Featured destination 3</label>
                <input id="dashboardFeaturedTitle3" value="${escapeHtml(content.featuredTitle3 || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedText3">Featured description 3</label>
                <textarea id="dashboardFeaturedText3" rows="2">${escapeHtml(content.featuredText3 || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedTitle4">Featured destination 4</label>
                <input id="dashboardFeaturedTitle4" value="${escapeHtml(content.featuredTitle4 || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardFeaturedText4">Featured description 4</label>
                <textarea id="dashboardFeaturedText4" rows="2">${escapeHtml(content.featuredText4 || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardServiceTitle1">Service 1</label>
                <input id="dashboardServiceTitle1" value="${escapeHtml(content.serviceTitle1 || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardServiceText1">Service 1 description</label>
                <textarea id="dashboardServiceText1" rows="2">${escapeHtml(content.serviceText1 || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardNewsletterTitle">Newsletter heading</label>
                <input id="dashboardNewsletterTitle" value="${escapeHtml(content.newsletterTitle || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardNewsletterText">Newsletter text</label>
                <textarea id="dashboardNewsletterText" rows="2">${escapeHtml(content.newsletterText || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardFooterDescription">Footer description</label>
                <textarea id="dashboardFooterDescription" rows="2">${escapeHtml(content.footerDescription || '')}</textarea>
            </div>
            <div class="dashboard-field">
                <label for="dashboardFooterLocation">Footer location</label>
                <input id="dashboardFooterLocation" value="${escapeHtml(content.footerLocation || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardFooterPhone">Footer phone</label>
                <input id="dashboardFooterPhone" value="${escapeHtml(content.footerPhone || '')}" />
            </div>
            <div class="dashboard-field">
                <label for="dashboardFooterEmail">Footer email</label>
                <input id="dashboardFooterEmail" value="${escapeHtml(content.footerEmail || '')}" />
            </div>
        </div>
        <div class="dashboard-actions">
            <button class="secondary" type="button" id="dashboardResetBtn">Reset</button>
            <button class="primary" type="button" id="dashboardSaveBtn">Save Changes</button>
        </div>
    `;

    panel.classList.add('active');
    backdrop.classList.add('active');

    document.getElementById('dashboardSaveBtn').addEventListener('click', () => {
        const updatedContent = {
            ...content,
            siteName: document.getElementById('dashboardSiteName').value.trim() || defaultDashboardContent.siteName,
            attractionsHeaderTitle: document.getElementById('dashboardAttractionsHeaderTitle').value.trim() || defaultDashboardContent.attractionsHeaderTitle,
            attractionsHeaderText: document.getElementById('dashboardAttractionsHeaderText').value.trim() || defaultDashboardContent.attractionsHeaderText,
            safariHeaderTitle: document.getElementById('dashboardSafariHeaderTitle').value.trim() || defaultDashboardContent.safariHeaderTitle,
            safariHeaderText: document.getElementById('dashboardSafariHeaderText').value.trim() || defaultDashboardContent.safariHeaderText,
            aboutHeaderTitle: document.getElementById('dashboardAboutHeaderTitle').value.trim() || defaultDashboardContent.aboutHeaderTitle,
            aboutHeaderText: document.getElementById('dashboardAboutHeaderText').value.trim() || defaultDashboardContent.aboutHeaderText,
            contactHeaderTitle: document.getElementById('dashboardContactHeaderTitle').value.trim() || defaultDashboardContent.contactHeaderTitle,
            contactHeaderText: document.getElementById('dashboardContactHeaderText').value.trim() || defaultDashboardContent.contactHeaderText,
            heroTitle: document.getElementById('dashboardHeroTitle').value.trim() || defaultDashboardContent.heroTitle,
            heroSubtitle: document.getElementById('dashboardHeroSubtitle').value.trim() || defaultDashboardContent.heroSubtitle,
            heroCta: document.getElementById('dashboardHeroCta').value.trim() || defaultDashboardContent.heroCta,
            featuredTitle1: document.getElementById('dashboardFeaturedTitle1').value.trim() || defaultDashboardContent.featuredTitle1,
            featuredText1: document.getElementById('dashboardFeaturedText1').value.trim() || defaultDashboardContent.featuredText1,
            featuredTitle2: document.getElementById('dashboardFeaturedTitle2').value.trim() || defaultDashboardContent.featuredTitle2,
            featuredText2: document.getElementById('dashboardFeaturedText2').value.trim() || defaultDashboardContent.featuredText2,
            featuredTitle3: document.getElementById('dashboardFeaturedTitle3').value.trim() || defaultDashboardContent.featuredTitle3,
            featuredText3: document.getElementById('dashboardFeaturedText3').value.trim() || defaultDashboardContent.featuredText3,
            featuredTitle4: document.getElementById('dashboardFeaturedTitle4').value.trim() || defaultDashboardContent.featuredTitle4,
            featuredText4: document.getElementById('dashboardFeaturedText4').value.trim() || defaultDashboardContent.featuredText4,
            newsletterTitle: document.getElementById('dashboardNewsletterTitle').value.trim() || defaultDashboardContent.newsletterTitle,
            newsletterText: document.getElementById('dashboardNewsletterText').value.trim() || defaultDashboardContent.newsletterText,
            footerDescription: document.getElementById('dashboardFooterDescription').value.trim() || defaultDashboardContent.footerDescription,
            footerLocation: document.getElementById('dashboardFooterLocation').value.trim() || defaultDashboardContent.footerLocation,
            footerPhone: document.getElementById('dashboardFooterPhone').value.trim() || defaultDashboardContent.footerPhone,
            footerEmail: document.getElementById('dashboardFooterEmail').value.trim() || defaultDashboardContent.footerEmail
        };
        saveDashboardContent(updatedContent);
        applyDashboardContent(updatedContent);
        closeDashboard();
        showNotification('Homepage content updated.', 'success');
    });

    document.getElementById('dashboardResetBtn').addEventListener('click', () => {
        saveDashboardContent(defaultDashboardContent);
        applyDashboardContent(defaultDashboardContent);
        closeDashboard();
        showNotification('Homepage content reset to defaults.', 'info');
    });
}

function closeDashboard() {
    const panel = document.getElementById('dashboardPanel');
    const backdrop = document.getElementById('dashboardBackdrop');
    if (panel) panel.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
}

function renderAdminPage() {
    const content = getAdminContent();
    const featuredEditor = document.getElementById('featuredItemsEditor');
    const heroSlidesEditor = document.getElementById('heroSlidesEditor');
    const travelInsightsEditor = document.getElementById('travelInsightsEditor');
    const servicesEditor = document.getElementById('servicesItemsEditor');

    if (!featuredEditor || !servicesEditor || !heroSlidesEditor || !travelInsightsEditor) return;

    document.getElementById('siteName').value = content.siteName || '';
    document.getElementById('heroTitle').value = content.heroTitle || '';
    document.getElementById('heroSubtitle').value = content.heroSubtitle || '';
    document.getElementById('heroCta').value = content.heroCta || '';
    document.getElementById('newsletterTitle').value = content.newsletterTitle || '';
    document.getElementById('newsletterText').value = content.newsletterText || '';
    document.getElementById('footerDescription').value = content.footerDescription || '';
    document.getElementById('footerLocation').value = content.footerLocation || '';
    document.getElementById('footerPhone').value = content.footerPhone || '';
    document.getElementById('footerEmail').value = content.footerEmail || '';

    featuredEditor.innerHTML = '';
    const featuredItems = content.featuredItems || [
        { title: 'Masai Mara', description: 'Witness the Great Migration and encounter Africa\'s "Big Five"' },
        { title: 'Mount Kenya', description: 'Conquer East Africa\'s second-highest peak' }
    ];

    featuredItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'admin-item-card';
        card.innerHTML = `
            <label>
                <span>Destination title</span>
                <input type="text" class="featuredTitle" value="${escapeHtml(item.title || '')}" />
            </label>
            <label>
                <span>Description</span>
                <textarea class="featuredDescription" rows="2">${escapeHtml(item.description || '')}</textarea>
            </label>
            <div class="admin-item-actions">
                <button type="button" class="remove-btn" data-remove-featured="${index}">Remove</button>
            </div>
        `;
        featuredEditor.appendChild(card);
    });

    heroSlidesEditor.innerHTML = '';
    const heroSlides = Array.isArray(content.heroSlides) && content.heroSlides.length > 0 ? content.heroSlides : defaultDashboardContent.heroSlides;

    heroSlides.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'admin-item-card';
        card.innerHTML = `
            <label>
                <span>Slide title</span>
                <input type="text" class="slideTitle" value="${escapeHtml(item.title || '')}" />
            </label>
            <label>
                <span>Slide subtitle</span>
                <input type="text" class="slideSubtitle" value="${escapeHtml(item.subtitle || '')}" />
            </label>
            <label>
                <span>Image URL</span>
                <input type="text" class="slideImage" value="${escapeHtml(item.image || '')}" />
            </label>
            <label>
                <span>Alt text</span>
                <input type="text" class="slideAlt" value="${escapeHtml(item.alt || '')}" />
            </label>
            <div class="admin-item-actions">
                <button type="button" class="remove-btn" data-remove-slide="${index}">Remove</button>
            </div>
        `;
        heroSlidesEditor.appendChild(card);
    });

    travelInsightsEditor.innerHTML = '';
    const insightsItems = Array.isArray(content.travelInsights) && content.travelInsights.length > 0 ? content.travelInsights : defaultDashboardContent.travelInsights;

    insightsItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'admin-item-card';
        card.innerHTML = `
            <label>
                <span>Insight title</span>
                <input type="text" class="insightTitle" value="${escapeHtml(item.title || '')}" />
            </label>
            <label>
                <span>Description</span>
                <textarea class="insightDescription" rows="2">${escapeHtml(item.description || '')}</textarea>
            </label>
            <label>
                <span>Image URL</span>
                <input type="text" class="insightImage" value="${escapeHtml(item.image || '')}" />
            </label>
            <label>
                <span>Alt text</span>
                <input type="text" class="insightAlt" value="${escapeHtml(item.alt || '')}" />
            </label>
            <div class="admin-item-actions">
                <button type="button" class="remove-btn" data-remove-insight="${index}">Remove</button>
            </div>
        `;
        travelInsightsEditor.appendChild(card);
    });

    servicesEditor.innerHTML = '';
    const servicesItems = content.servicesItems || [
        { title: 'Wildlife Safari', description: 'Professional guided safari tours to encounter Africa\'s incredible wildlife' }
    ];

    servicesItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'admin-item-card';
        card.innerHTML = `
            <label>
                <span>Service title</span>
                <input type="text" class="serviceTitle" value="${escapeHtml(item.title || '')}" />
            </label>
            <label>
                <span>Description</span>
                <textarea class="serviceDescription" rows="2">${escapeHtml(item.description || '')}</textarea>
            </label>
            <div class="admin-item-actions">
                <button type="button" class="remove-btn" data-remove-service="${index}">Remove</button>
            </div>
        `;
        servicesEditor.appendChild(card);
    });
}

function saveAdminForm() {
    const content = getAdminContent();
    content.siteName = document.getElementById('siteName').value.trim() || defaultDashboardContent.siteName;
    content.heroTitle = document.getElementById('heroTitle').value.trim() || defaultDashboardContent.heroTitle;
    content.heroSubtitle = document.getElementById('heroSubtitle').value.trim() || defaultDashboardContent.heroSubtitle;
    content.heroCta = document.getElementById('heroCta').value.trim() || defaultDashboardContent.heroCta;
    content.newsletterTitle = document.getElementById('newsletterTitle').value.trim() || defaultDashboardContent.newsletterTitle;
    content.newsletterText = document.getElementById('newsletterText').value.trim() || defaultDashboardContent.newsletterText;
    content.footerDescription = document.getElementById('footerDescription').value.trim() || defaultDashboardContent.footerDescription;
    content.footerLocation = document.getElementById('footerLocation').value.trim() || defaultDashboardContent.footerLocation;
    content.footerPhone = document.getElementById('footerPhone').value.trim() || defaultDashboardContent.footerPhone;
    content.footerEmail = document.getElementById('footerEmail').value.trim() || defaultDashboardContent.footerEmail;

    content.featuredItems = Array.from(document.querySelectorAll('#featuredItemsEditor .admin-item-card')).map(card => ({
        title: card.querySelector('.featuredTitle').value.trim(),
        description: card.querySelector('.featuredDescription').value.trim()
    })).filter(item => item.title || item.description);

    content.heroSlides = Array.from(document.querySelectorAll('#heroSlidesEditor .admin-item-card')).map(card => ({
        title: card.querySelector('.slideTitle').value.trim(),
        subtitle: card.querySelector('.slideSubtitle').value.trim(),
        image: card.querySelector('.slideImage').value.trim(),
        alt: card.querySelector('.slideAlt').value.trim()
    })).filter(item => item.title || item.subtitle || item.image || item.alt);

    content.travelInsights = Array.from(document.querySelectorAll('#travelInsightsEditor .admin-item-card')).map(card => ({
        title: card.querySelector('.insightTitle').value.trim(),
        description: card.querySelector('.insightDescription').value.trim(),
        image: card.querySelector('.insightImage').value.trim(),
        alt: card.querySelector('.insightAlt').value.trim()
    })).filter(item => item.title || item.description || item.image || item.alt);

    content.servicesItems = Array.from(document.querySelectorAll('#servicesItemsEditor .admin-item-card')).map(card => ({
        title: card.querySelector('.serviceTitle').value.trim(),
        description: card.querySelector('.serviceDescription').value.trim()
    })).filter(item => item.title || item.description);

    saveAdminContent(content);
    saveDashboardContent(content);
    applyDashboardContent(content);
    showNotification('Admin content saved successfully.', 'success');
}

function resetAdminContent() {
    const resetContent = {
        ...defaultDashboardContent,
        featuredItems: defaultDashboardContent.featuredItems || [],
        servicesItems: defaultDashboardContent.servicesItems || [],
        heroSlides: defaultDashboardContent.heroSlides || [],
        travelInsights: defaultDashboardContent.travelInsights || []
    };
    saveAdminContent(resetContent);
    saveDashboardContent(resetContent);
    applyDashboardContent(resetContent);
    renderAdminPage();
    showNotification('Admin content reset to defaults.', 'info');
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
function bootAuth() {
    updateAuthUI();
    initializeGoogleAuth();
}

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

    const dashboardToggle = document.getElementById('dashboardToggle');
    const dashboardBackdrop = document.createElement('div');
    dashboardBackdrop.id = 'dashboardBackdrop';
    dashboardBackdrop.className = 'dashboard-backdrop';
    const dashboardPanel = document.createElement('div');
    dashboardPanel.id = 'dashboardPanel';
    dashboardPanel.className = 'dashboard-panel';
    document.body.appendChild(dashboardBackdrop);
    document.body.appendChild(dashboardPanel);

    if (dashboardToggle) {
        dashboardToggle.addEventListener('click', () => openDashboard());
    }

    dashboardBackdrop.addEventListener('click', closeDashboard);

    const dashboardContent = getDashboardContent();
    applyDashboardContent(dashboardContent);

    window.addEventListener('siteContentUpdated', (event) => {
        const updatedContent = event.detail || getDashboardContent();
        applyDashboardContent(updatedContent);
    });

    window.addEventListener('storage', (event) => {
        if (event.key === DASHBOARD_STORAGE_KEY || event.key === ADMIN_STORAGE_KEY) {
            try {
                const updatedContent = event.newValue ? JSON.parse(event.newValue) : getDashboardContent();
                applyDashboardContent(updatedContent);
            } catch (error) {
                applyDashboardContent(getDashboardContent());
            }
        }
    });

    if (document.body.dataset.page === 'admin') {
        renderAdminPage();

        document.getElementById('siteContentForm').addEventListener('submit', (event) => {
            event.preventDefault();
            saveAdminForm();
        });

        document.getElementById('addFeaturedBtn').addEventListener('click', () => {
            const editor = document.getElementById('featuredItemsEditor');
            const card = document.createElement('div');
            card.className = 'admin-item-card';
            card.innerHTML = `
                <label>
                    <span>Destination title</span>
                    <input type="text" class="featuredTitle" value="" />
                </label>
                <label>
                    <span>Description</span>
                    <textarea class="featuredDescription" rows="2"></textarea>
                </label>
                <div class="admin-item-actions">
                    <button type="button" class="remove-btn">Remove</button>
                </div>
            `;
            card.querySelector('.remove-btn').addEventListener('click', () => card.remove());
            editor.appendChild(card);
        });

        document.getElementById('addSlideBtn').addEventListener('click', () => {
            const editor = document.getElementById('heroSlidesEditor');
            const card = document.createElement('div');
            card.className = 'admin-item-card';
            card.innerHTML = `
                <label>
                    <span>Slide title</span>
                    <input type="text" class="slideTitle" value="" />
                </label>
                <label>
                    <span>Slide subtitle</span>
                    <input type="text" class="slideSubtitle" value="" />
                </label>
                <label>
                    <span>Image URL</span>
                    <input type="text" class="slideImage" value="" placeholder="walk.lion.jpg" />
                </label>
                <label>
                    <span>Alt text</span>
                    <input type="text" class="slideAlt" value="" />
                </label>
                <div class="admin-item-actions">
                    <button type="button" class="remove-btn">Remove</button>
                </div>
            `;
            card.querySelector('.remove-btn').addEventListener('click', () => card.remove());
            editor.appendChild(card);
        });

        document.getElementById('addInsightBtn').addEventListener('click', () => {
            const editor = document.getElementById('travelInsightsEditor');
            const card = document.createElement('div');
            card.className = 'admin-item-card';
            card.innerHTML = `
                <label>
                    <span>Insight title</span>
                    <input type="text" class="insightTitle" value="" />
                </label>
                <label>
                    <span>Description</span>
                    <textarea class="insightDescription" rows="2"></textarea>
                </label>
                <label>
                    <span>Image URL</span>
                    <input type="text" class="insightImage" value="" placeholder="https://example.com/image.jpg" />
                </label>
                <label>
                    <span>Alt text</span>
                    <input type="text" class="insightAlt" value="" />
                </label>
                <div class="admin-item-actions">
                    <button type="button" class="remove-btn">Remove</button>
                </div>
            `;
            card.querySelector('.remove-btn').addEventListener('click', () => card.remove());
            editor.appendChild(card);
        });

        document.getElementById('addServiceBtn').addEventListener('click', () => {
            const editor = document.getElementById('servicesItemsEditor');
            const card = document.createElement('div');
            card.className = 'admin-item-card';
            card.innerHTML = `
                <label>
                    <span>Service title</span>
                    <input type="text" class="serviceTitle" value="" />
                </label>
                <label>
                    <span>Description</span>
                    <textarea class="serviceDescription" rows="2"></textarea>
                </label>
                <div class="admin-item-actions">
                    <button type="button" class="remove-btn">Remove</button>
                </div>
            `;
            card.querySelector('.remove-btn').addEventListener('click', () => card.remove());
            editor.appendChild(card);
        });

        document.getElementById('resetAdminBtn').addEventListener('click', () => {
            resetAdminContent();
        });
    }

    bootAuth();
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
