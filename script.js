// Main script for homepage functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Initialize data manager and load preview content
    const dataManager = new DataManager();
    initializeHomepage(dataManager);
});

// Mobile Navigation Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');

mobileMenu.addEventListener('click', function() {
    mobileMenu.classList.toggle('is-active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightActiveSection() {
    let current = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', function() {
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 150);
    }
});

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 200;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Intersection Observer for counter animation
const statsSection = document.querySelector('.publications');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Create mailto link
        const mailtoLink = `mailto:Saurav.bhattarai@students.jsums.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message
        showNotification('Email client opened! Please send the email from your default email application.', 'success');
        
        // Reset form
        contactForm.reset();
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Research cards hover effect
const researchCards = document.querySelectorAll('.research-card');
researchCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Publication items animation
const publicationItems = document.querySelectorAll('.publication-item');
publicationItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
});

// Timeline animation
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.3 });

timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    timelineObserver.observe(item);
});

// Lazy loading for images
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Scroll to top button
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(100px);
    transition: all 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
`;

document.body.appendChild(scrollToTopBtn);

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.transform = 'translateY(0)';
    } else {
        scrollToTopBtn.style.transform = 'translateY(100px)';
    }
});

// Scroll to top functionality
scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect to scroll to top button
scrollToTopBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(0) scale(1.1)';
});

scrollToTopBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
});

// Loading screen (optional)
window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Console greeting message
console.log(`
🌊 Welcome to Saurav Bhattarai's Website! 🌊
=====================================
Water Resource Engineer & Hydro-climatology Researcher
🔬 PhD Candidate at Jackson State University
📧 Contact: Saurav.bhattarai@students.jsums.edu
=====================================
`);

// Performance optimization: Debounce scroll events
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

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(function() {
    highlightActiveSection();
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape') {
        mobileMenu.classList.remove('is-active');
        navMenu.classList.remove('active');
    }
});

// Add focus styles for accessibility
document.addEventListener('DOMContentLoaded', function() {
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #3b82f6';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Initialize all managers after DOM is loaded
    if (typeof window.dataManager !== 'undefined') {
        // Initialize publications manager
        if (typeof PublicationsManager !== 'undefined' && document.getElementById('publications-content')) {
            window.publicationsManager = new PublicationsManager('publications-content');
            window.publicationsManager.init();
        }

        // Initialize research manager
        if (typeof ResearchManager !== 'undefined' && document.getElementById('research-content')) {
            window.researchManager = new ResearchManager('research-content');
            window.researchManager.init();
        }

        // Initialize conferences manager
        if (typeof ConferencesManager !== 'undefined' && document.getElementById('conferences-content')) {
            window.conferencesManager = new ConferencesManager('conferences-content');
            window.conferencesManager.init();
        }

        // Initialize achievements manager
        if (typeof AchievementsManager !== 'undefined') {
            const achievementsContainer = document.querySelector('#achievements .container');
            if (achievementsContainer) {
                achievementsContainer.id = 'achievements-content';
                window.achievementsManager = new AchievementsManager('achievements-content');
                window.achievementsManager.init();
            }
        }
    }
});

// Homepage preview functionality
async function initializeHomepage(dataManager) {
    try {
        // Load all data concurrently
        const [publications, research, conferences, achievements] = await Promise.all([
            dataManager.getPublications(),
            dataManager.getResearch(),
            dataManager.getConferences(),
            dataManager.getAchievements()
        ]);

        // Update homepage statistics only (minimal overview)
        updateHomepageStats(publications, research, conferences, achievements);
        
    } catch (error) {
        console.error('Error loading homepage data:', error);
    }
}

function updateHomepageStats(publications, research, conferences, achievements) {
    // Update profile stats
    const totalPubsElement = document.getElementById('total-pubs-count');
    const totalConfElement = document.getElementById('total-conf-count');
    
    if (totalPubsElement && publications) {
        const totalPubs = (publications.published?.length || 0) + (publications.underReview?.length || 0);
        totalPubsElement.textContent = totalPubs;
    }
    
    if (totalConfElement && conferences) {
        totalConfElement.textContent = conferences.length;
    }

    // Update research stats
    const researchProjectsElement = document.getElementById('research-projects-count');
    const featuredResearchElement = document.getElementById('featured-research-count');
    
    if (researchProjectsElement && research) {
        researchProjectsElement.textContent = research.length;
    }
    
    if (featuredResearchElement && research) {
        const featuredCount = research.filter(r => r.featured).length;
        featuredResearchElement.textContent = featuredCount;
    }

    // Update publications stats
    const totalPublicationsElement = document.getElementById('total-publications-count');
    const recentPublicationsElement = document.getElementById('recent-publications-count');
    
    if (totalPublicationsElement && publications) {
        const totalPubs = (publications.published?.length || 0) + (publications.underReview?.length || 0);
        totalPublicationsElement.textContent = totalPubs;
    }
    
    if (recentPublicationsElement && publications) {
        const currentYear = new Date().getFullYear();
        const recentPubs = publications.published?.filter(p => p.year == currentYear).length || 0;
        recentPublicationsElement.textContent = recentPubs;
    }

    // Update conferences stats
    const totalConferencesElement = document.getElementById('total-conferences-count');
    const upcomingConferencesElement = document.getElementById('upcoming-conferences-count');
    
    if (totalConferencesElement && conferences) {
        totalConferencesElement.textContent = conferences.length;
    }
    
    if (upcomingConferencesElement && conferences) {
        const upcomingCount = conferences.filter(c => c.status === 'upcoming').length;
        upcomingConferencesElement.textContent = upcomingCount;
    }    // Update achievements stats
    const totalAchievementsElement = document.getElementById('total-achievements-count');
    const recentAchievementsElement = document.getElementById('recent-achievements-count');
    
    if (totalAchievementsElement && achievements) {
        totalAchievementsElement.textContent = achievements.length;
    }
    
    if (recentAchievementsElement && achievements) {
        const currentYear = new Date().getFullYear();
        const recentAchievements = achievements.filter(a => {
            // Handle both single year and year range formats
            const yearStr = a.year.toString();
            if (yearStr.includes('-')) {
                const years = yearStr.split('-');
                const endYear = parseInt(years[1]);
                return endYear === currentYear;
            } else {
                return parseInt(yearStr) === currentYear;
            }
        }).length;
        recentAchievementsElement.textContent = recentAchievements;
    }
}