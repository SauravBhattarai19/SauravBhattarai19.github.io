// Redesigned Achievements page functionality
class AchievementsPage {
    constructor() {
        this.dataManager = new DataManager();
        this.achievementsData = null;
        this.categories = ['Fellowship', 'Scholarship', 'Competition', 'Travel Grant', 'Leadership', 'Participation'];
        this.init();
    }

    async init() {
        try {
            this.achievementsData = await this.dataManager.getAchievements();
            if (this.achievementsData) {
                this.renderFeaturedAchievements();
                this.renderCategoryAchievements();
                this.updateCategoryCounts();
            }
        } catch (error) {
            console.error('Error initializing achievements page:', error);
        }
    }

    renderFeaturedAchievements() {
        const featuredGrid = document.getElementById('featured-achievements-grid');
        if (!featuredGrid) return;

        const featuredAchievements = (this.achievementsData || [])
            .filter(achievement => achievement.featured)
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));

        if (featuredAchievements.length === 0) {
            featuredGrid.innerHTML = '<p class="no-data">No featured achievements available.</p>';
            return;
        }

        featuredGrid.innerHTML = featuredAchievements.map((achievement, index) => `
            <div class="featured-achievement-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="featured-achievement-header">
                    <div class="featured-achievement-icon ${achievement.category.toLowerCase().replace(/\s+/g, '-')}">
                        <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                    </div>
                    <div class="featured-achievement-year">${achievement.year}</div>
                </div>
                <div class="featured-achievement-content">
                    <h3 class="featured-achievement-title">${achievement.title}</h3>
                    <p class="featured-achievement-organization">${achievement.organization}</p>
                    ${achievement.location ? `<p class="featured-achievement-location"><i class="fas fa-map-marker-alt"></i> ${achievement.location}</p>` : ''}
                    <p class="featured-achievement-description">${achievement.description}</p>
                    <div class="featured-achievement-footer">
                        <div class="featured-category-badge ${achievement.category.toLowerCase().replace(/\s+/g, '-')}">
                            ${achievement.category}
                        </div>
                        ${achievement.award_amount ? `<div class="featured-achievement-amount">$${achievement.award_amount}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCategoryAchievements() {
        this.categories.forEach(category => {
            this.renderCategorySection(category);
        });
    }

    renderCategorySection(category) {
        const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
        const container = document.getElementById(`${categoryKey}-achievements`);
        if (!container) return;

        const categoryAchievements = (this.achievementsData || [])
            .filter(achievement => achievement.category === category)
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));

        if (categoryAchievements.length === 0) {
            container.innerHTML = `
                <div class="category-empty">
                    <i class="fas ${this.getCategoryIcon(category)}"></i>
                    <p>No ${category.toLowerCase()} achievements yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categoryAchievements.map((achievement, index) => `
            <div class="achievement-card" data-aos="fade-right" data-aos-delay="${index * 50}">
                <div class="achievement-card-header">
                    <div class="achievement-card-icon ${categoryKey}">
                        <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                    </div>
                    <div class="achievement-card-year">${achievement.year}</div>
                </div>
                <div class="achievement-card-body">
                    <h4 class="achievement-card-title">${achievement.title}</h4>
                    <p class="achievement-card-organization">${achievement.organization}</p>
                    ${achievement.location ? `<p class="achievement-card-location"><i class="fas fa-map-marker-alt"></i> ${achievement.location}</p>` : ''}
                    <p class="achievement-card-description">${achievement.description}</p>
                    <div class="achievement-card-footer">
                        <div class="achievement-card-category ${categoryKey}">
                            ${achievement.category}
                        </div>
                        ${achievement.award_amount ? `<div class="achievement-card-amount">$${achievement.award_amount}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateCategoryCounts() {
        this.categories.forEach(category => {
            const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
            const countElement = document.getElementById(`${categoryKey}-count`);
            if (!countElement) return;

            const count = (this.achievementsData || [])
                .filter(achievement => achievement.category === category)
                .length;

            countElement.textContent = `${count} Achievement${count !== 1 ? 's' : ''}`;
        });
    }

    getCategoryIcon(category) {
        const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
        switch (normalizedCategory) {
            case 'fellowship':
                return 'fa-award';
            case 'scholarship':
                return 'fa-medal';
            case 'competition':
                return 'fa-trophy';
            case 'travel-grant':
                return 'fa-plane';
            case 'leadership':
                return 'fa-users';
            case 'participation':
                return 'fa-certificate';
            default:
                return 'fa-star';
        }
    }

    // Add smooth scroll functionality for horizontal scrolling
    setupScrollControls() {
        const scrollContainers = document.querySelectorAll('.achievements-horizontal-scroll');
        
        scrollContainers.forEach(container => {
            let isDown = false;
            let startX;
            let scrollLeft;

            container.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
                container.style.cursor = 'grabbing';
            });

            container.addEventListener('mouseleave', () => {
                isDown = false;
                container.style.cursor = 'grab';
            });

            container.addEventListener('mouseup', () => {
                isDown = false;
                container.style.cursor = 'grab';
            });

            container.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
            });

            // Touch events for mobile
            container.addEventListener('touchstart', (e) => {
                startX = e.touches[0].pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            });

            container.addEventListener('touchmove', (e) => {
                const x = e.touches[0].pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const achievementsPage = new AchievementsPage();
    
    // Setup scroll controls after a short delay to ensure elements are rendered
    setTimeout(() => {
        achievementsPage.setupScrollControls();
    }, 500);
});
