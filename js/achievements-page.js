// Achievements page functionality
class AchievementsPage {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.achievementsData = null;
        this.init();
    }

    async init() {
        try {
            this.achievementsData = await this.dataManager.getAchievements();
            if (this.achievementsData) {
                this.renderRecentAchievements();
                this.renderAchievementTimeline();
                this.renderAllAchievements();
                this.setupEventListeners();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error initializing achievements page:', error);
        }
    }    renderRecentAchievements() {
        const recentGrid = document.getElementById('recent-achievements-grid');
        if (!recentGrid) return;

        const recentAchievements = (this.achievementsData || [])
            .filter(achievement => achievement.featured)
            .sort((a, b) => parseInt(b.year) - parseInt(a.year))
            .slice(0, 3);

        if (recentAchievements.length === 0) {
            recentGrid.innerHTML = '<p class="no-data">No recent achievements available.</p>';
            return;
        }

        recentGrid.innerHTML = recentAchievements.map((achievement, index) => `
            <div class="recent-achievement-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="achievement-header">
                    <div class="achievement-icon">
                        <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                    </div>
                    <div class="achievement-year">${achievement.year}</div>
                </div>
                <div class="achievement-content">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-organization">${achievement.organization}</p>
                    ${achievement.location ? `<p class="achievement-location"><i class="fas fa-map-marker-alt"></i> ${achievement.location}</p>` : ''}
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-footer">
                        <div class="achievement-category-badge ${achievement.category.toLowerCase().replace(/\s+/g, '-')}">
                            ${achievement.category}
                        </div>
                        ${achievement.award_amount ? `<div class="achievement-amount">$${achievement.award_amount}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }    renderAchievementTimeline() {
        const timeline = document.getElementById('achievement-timeline');
        if (!timeline) return;

        const sortedAchievements = (this.achievementsData || [])
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));

        timeline.innerHTML = sortedAchievements.map((achievement, index) => `
            <div class="timeline-item" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="timeline-marker">
                    <div class="marker-icon ${achievement.category.toLowerCase().replace(/\s+/g, '-')}">
                        <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                    </div>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4 class="timeline-title">${achievement.title}</h4>
                        <span class="timeline-date">${achievement.year}</span>
                    </div>
                    <p class="timeline-organization">${achievement.organization}</p>
                    ${achievement.location ? `<p class="timeline-location"><i class="fas fa-map-marker-alt"></i> ${achievement.location}</p>` : ''}
                    <p class="timeline-description">${achievement.description}</p>
                    <div class="timeline-badges">
                        <span class="category-badge ${achievement.category.toLowerCase().replace(/\s+/g, '-')}">${achievement.category}</span>
                        ${achievement.award_amount ? `<span class="amount-badge">$${achievement.award_amount}</span>` : ''}
                        ${achievement.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }    renderAllAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;

        let filteredAchievements = this.achievementsData || [];

        // Apply filters
        if (this.currentFilter !== 'all') {
            filteredAchievements = filteredAchievements.filter(achievement => {
                return achievement.category.toLowerCase().replace(/\s+/g, '-') === this.currentFilter;
            });
        }

        // Apply sorting
        filteredAchievements.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return parseInt(b.year) - parseInt(a.year);
                case 'date-asc':
                    return parseInt(a.year) - parseInt(b.year);
                case 'importance':
                    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        achievementsGrid.innerHTML = filteredAchievements.map((achievement, index) => `
            <div class="achievement-card ${achievement.featured ? 'featured' : ''}" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="card-header">
                    <div class="achievement-icon ${achievement.category.toLowerCase().replace(/\s+/g, '-')}">
                        <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                    </div>
                    <div class="achievement-year">${achievement.year}</div>
                </div>
                <div class="card-body">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-organization">${achievement.organization}</p>
                    ${achievement.location ? `<p class="achievement-location"><i class="fas fa-map-marker-alt"></i> ${achievement.location}</p>` : ''}
                    <p class="achievement-description">${achievement.description}</p>
                    
                    <div class="achievement-footer">
                        <div class="achievement-badges">
                            <span class="category-badge ${achievement.category.toLowerCase().replace(/\s+/g, '-')}">${achievement.category}</span>
                            ${achievement.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                        </div>
                        ${achievement.award_amount ? `
                            <div class="achievement-amount">
                                <i class="fas fa-dollar-sign"></i>
                                $${achievement.award_amount}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderAllAchievements();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderAllAchievements();
            });
        }
    }    updateStats() {
        if (!this.achievementsData) return;
        
        const totalAwards = this.achievementsData.length;
        const featuredAchievements = this.achievementsData.filter(a => a.featured).length;
        
        // Calculate total funding from awards that have award_amount
        const totalFunding = this.achievementsData
            .filter(a => a.award_amount)
            .reduce((sum, a) => sum + parseFloat(a.award_amount), 0);
        
        // Count different categories
        const fellowships = this.achievementsData.filter(a => 
            a.category.toLowerCase().includes('fellowship')).length;
        const scholarships = this.achievementsData.filter(a => 
            a.category.toLowerCase().includes('scholarship')).length;
        
        // Update DOM elements if they exist
        const totalAwardsEl = document.getElementById('total-awards');
        const totalFundingEl = document.getElementById('total-funding');
        const certificationsEl = document.getElementById('certifications');
        const fellowshipsEl = document.getElementById('fellowships');
        
        if (totalAwardsEl) totalAwardsEl.textContent = totalAwards;
        if (totalFundingEl) {
            totalFundingEl.textContent = totalFunding > 0 ? 
                `$${(totalFunding / 1000).toFixed(0)}K+` : 'Multiple';
        }
        if (certificationsEl) certificationsEl.textContent = featuredAchievements;
        if (fellowshipsEl) fellowshipsEl.textContent = fellowships + scholarships;
    }getCategoryIcon(category) {
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
            case 'academic':
                return 'fa-graduation-cap';
            case 'research':
                return 'fa-flask';
            case 'professional':
                return 'fa-briefcase';
            case 'leadership':
                return 'fa-users';
            default:
                return 'fa-star';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AchievementsPage();
});
