// Achievements page functionality
class AchievementsPage {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.init();
    }

    async init() {
        try {
            await this.dataManager.loadData();
            this.renderRecentAchievements();
            this.renderAchievementTimeline();
            this.renderAllAchievements();
            this.setupEventListeners();
            this.updateStats();
        } catch (error) {
            console.error('Error initializing achievements page:', error);
        }
    }

    renderRecentAchievements() {
        const recentGrid = document.getElementById('recent-achievements-grid');
        if (!recentGrid) return;

        const recentAchievements = this.dataManager.achievements
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        recentGrid.innerHTML = recentAchievements.map(achievement => `
            <div class="recent-achievement-card" data-aos="fade-up" data-aos-delay="100">
                <div class="achievement-icon">
                    <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                </div>
                <div class="achievement-content">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-organization">${achievement.organization}</p>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-date">
                        <i class="fas fa-calendar"></i>
                        ${new Date(achievement.date).toLocaleDateString()}
                    </div>
                    <div class="achievement-category-badge ${achievement.category}">
                        ${achievement.category}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAchievementTimeline() {
        const timeline = document.getElementById('achievement-timeline');
        if (!timeline) return;

        const sortedAchievements = this.dataManager.achievements
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        timeline.innerHTML = sortedAchievements.map((achievement, index) => `
            <div class="timeline-item" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="timeline-marker">
                    <div class="marker-icon ${achievement.category}">
                        <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                    </div>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4 class="timeline-title">${achievement.title}</h4>
                        <span class="timeline-date">${new Date(achievement.date).getFullYear()}</span>
                    </div>
                    <p class="timeline-organization">${achievement.organization}</p>
                    <p class="timeline-description">${achievement.description}</p>
                    <div class="timeline-badges">
                        <span class="category-badge ${achievement.category}">${achievement.category}</span>
                        ${achievement.amount ? `<span class="amount-badge">$${achievement.amount}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAllAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;

        let filteredAchievements = this.dataManager.achievements;

        // Apply filters
        if (this.currentFilter !== 'all') {
            filteredAchievements = filteredAchievements.filter(achievement => {
                return achievement.category === this.currentFilter;
            });
        }

        // Apply sorting
        filteredAchievements.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'importance':
                    return (b.importance || 0) - (a.importance || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        achievementsGrid.innerHTML = filteredAchievements.map((achievement, index) => `
            <div class="achievement-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="card-header">
                    <div class="achievement-icon">
                        <i class="fas ${this.getCategoryIcon(achievement.category)}"></i>
                    </div>
                    <div class="achievement-badges">
                        <span class="category-badge ${achievement.category}">${achievement.category}</span>
                        ${achievement.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <p class="achievement-organization">${achievement.organization}</p>
                    <p class="achievement-description">${achievement.description}</p>
                    
                    <div class="achievement-details">
                        <div class="achievement-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(achievement.date).toLocaleDateString()}
                        </div>
                        ${achievement.amount ? `
                            <div class="achievement-amount">
                                <i class="fas fa-dollar-sign"></i>
                                $${achievement.amount.toLocaleString()}
                            </div>
                        ` : ''}
                        ${achievement.duration ? `
                            <div class="achievement-duration">
                                <i class="fas fa-clock"></i>
                                ${achievement.duration}
                            </div>
                        ` : ''}
                    </div>
                    
                    ${achievement.criteria ? `
                        <div class="achievement-criteria">
                            <h4>Selection Criteria:</h4>
                            <p>${achievement.criteria}</p>
                        </div>
                    ` : ''}
                    
                    ${achievement.impact ? `
                        <div class="achievement-impact">
                            <h4>Impact:</h4>
                            <p>${achievement.impact}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="card-footer">
                    ${achievement.certificate ? `
                        <a href="${achievement.certificate}" target="_blank" class="achievement-link">
                            <i class="fas fa-certificate"></i>
                            View Certificate
                        </a>
                    ` : ''}
                    ${achievement.announcement ? `
                        <a href="${achievement.announcement}" target="_blank" class="achievement-link">
                            <i class="fas fa-external-link-alt"></i>
                            Official Announcement
                        </a>
                    ` : ''}
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
    }

    updateStats() {
        const totalAwards = this.dataManager.achievements.length;
        const totalFunding = this.dataManager.achievements
            .filter(a => a.amount)
            .reduce((sum, a) => sum + a.amount, 0);
        const certifications = this.dataManager.achievements.filter(a => a.certificate).length;

        document.getElementById('total-awards').textContent = totalAwards;
        document.getElementById('total-funding').textContent = `$${(totalFunding / 1000).toFixed(0)}K`;
        document.getElementById('certifications').textContent = certifications;
    }

    getCategoryIcon(category) {
        switch (category) {
            case 'academic':
                return 'fa-graduation-cap';
            case 'research':
                return 'fa-flask';
            case 'professional':
                return 'fa-briefcase';
            case 'leadership':
                return 'fa-users';
            case 'fellowship':
                return 'fa-award';
            case 'scholarship':
                return 'fa-medal';
            default:
                return 'fa-trophy';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AchievementsPage();
});
