// Achievements Module
class AchievementsManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFilter = 'all';
        this.currentView = 'timeline';
    }

    async init() {
        try {
            const achievements = await window.dataManager.getAchievements();
            if (achievements) {
                this.renderAchievements(achievements);
            }
        } catch (error) {
            console.error('Error initializing achievements:', error);
            this.renderError();
        }
    }

    renderAchievements(achievements) {
        const filtered = this.filterAchievements(achievements);
        const sorted = this.sortAchievements(filtered);

        const html = `
            <div class="achievements-header">
                <h2>Awards & Achievements</h2>
                <div class="achievements-controls">
                    <div class="filter-controls">
                        <select id="achievements-filter" onchange="achievementsManager.setFilter(this.value)">
                            <option value="all">All Achievements</option>
                            <option value="fellowship">Fellowships</option>
                            <option value="scholarship">Scholarships</option>
                            <option value="competition">Competitions</option>
                            <option value="travel grant">Travel Grants</option>
                            <option value="featured">Featured</option>
                        </select>
                    </div>
                    <div class="view-controls">
                        <button onclick="achievementsManager.setView('timeline')" class="btn btn-sm ${this.currentView === 'timeline' ? 'active' : ''}">
                            <i class="fas fa-stream"></i> Timeline
                        </button>
                        <button onclick="achievementsManager.setView('grid')" class="btn btn-sm ${this.currentView === 'grid' ? 'active' : ''}">
                            <i class="fas fa-th"></i> Grid
                        </button>
                    </div>
                </div>
            </div>
            <div class="achievements-stats">
                <div class="stat-card">
                    <span class="stat-number">${achievements.length}</span>
                    <span class="stat-label">Total Awards</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${achievements.filter(a => a.featured).length}</span>
                    <span class="stat-label">Featured</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${new Set(achievements.map(a => a.category.toLowerCase())).size}</span>
                    <span class="stat-label">Categories</span>
                </div>
            </div>
            <div class="achievements-${this.currentView}">
                ${this.currentView === 'timeline' ? this.renderTimeline(sorted) : this.renderGrid(sorted)}
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderTimeline(achievements) {
        const groupedByYear = this.groupByYear(achievements);
        
        return `
            <div class="timeline">
                ${Object.keys(groupedByYear)
                    .sort((a, b) => parseInt(b) - parseInt(a))
                    .map(year => `
                        <div class="timeline-year" data-aos="fade-up">
                            <div class="year-marker">${year}</div>
                            <div class="timeline-items">
                                ${groupedByYear[year].map(achievement => this.renderTimelineItem(achievement)).join('')}
                            </div>
                        </div>
                    `).join('')}
            </div>
        `;
    }

    renderTimelineItem(achievement) {
        const categoryClass = achievement.category.toLowerCase().replace(/\s+/g, '-');
        const featuredClass = achievement.featured ? 'featured' : '';

        return `
            <div class="timeline-item ${featuredClass}" data-aos="fade-left">
                <div class="timeline-marker ${categoryClass}">
                    ${this.getCategoryIcon(achievement.category)}
                </div>
                <div class="timeline-content">
                    <div class="achievement-header">
                        <h4 class="achievement-title">${achievement.title}</h4>
                        <span class="achievement-category ${categoryClass}">${achievement.category}</span>
                        ${achievement.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                    <div class="achievement-organization">
                        <i class="fas fa-building"></i>
                        ${achievement.organization}
                        ${achievement.location ? `<span class="location">${achievement.location}</span>` : ''}
                    </div>
                    <p class="achievement-description">${achievement.description}</p>
                    ${achievement.award_amount ? `
                        <div class="achievement-amount">
                            <i class="fas fa-dollar-sign"></i>
                            ${achievement.award_amount}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderGrid(achievements) {
        return `
            <div class="achievements-grid">
                ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
            </div>
        `;
    }

    renderAchievementCard(achievement) {
        const categoryClass = achievement.category.toLowerCase().replace(/\s+/g, '-');
        const featuredClass = achievement.featured ? 'featured' : '';

        return `
            <div class="achievement-card ${featuredClass}" data-aos="fade-up">
                <div class="achievement-icon ${categoryClass}">
                    ${this.getCategoryIcon(achievement.category)}
                </div>
                <div class="achievement-content">
                    <div class="achievement-year">${achievement.year}</div>
                    <h4 class="achievement-title">${achievement.title}</h4>
                    <div class="achievement-organization">${achievement.organization}</div>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-footer">
                        <span class="achievement-category ${categoryClass}">${achievement.category}</span>
                        ${achievement.award_amount ? `<span class="achievement-amount">${achievement.award_amount}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            'Fellowship': 'fas fa-user-graduate',
            'Scholarship': 'fas fa-graduation-cap',
            'Competition': 'fas fa-trophy',
            'Travel Grant': 'fas fa-plane',
            'Award': 'fas fa-medal'
        };
        return `<i class="${icons[category] || 'fas fa-award'}"></i>`;
    }

    groupByYear(achievements) {
        return achievements.reduce((groups, achievement) => {
            const year = achievement.year.toString().split('-')[0]; // Handle ranges like "2024-2025"
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(achievement);
            return groups;
        }, {});
    }

    filterAchievements(achievements) {
        if (this.currentFilter === 'all') {
            return achievements;
        }
        if (this.currentFilter === 'featured') {
            return achievements.filter(achievement => achievement.featured);
        }
        return achievements.filter(achievement => 
            achievement.category.toLowerCase() === this.currentFilter.toLowerCase()
        );
    }

    sortAchievements(achievements) {
        return achievements.sort((a, b) => {
            const yearA = parseInt(a.year.toString().split('-')[0]);
            const yearB = parseInt(b.year.toString().split('-')[0]);
            return yearB - yearA;
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.init();
    }

    setView(view) {
        this.currentView = view;
        this.init();
    }

    renderError() {
        this.container.innerHTML = `
            <div class="error-message">
                <h3>Unable to load achievements</h3>
                <p>Please try refreshing the page or contact the site administrator.</p>
            </div>
        `;
    }

    async refresh() {
        await window.dataManager.refreshData('achievements.json');
        this.init();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('achievements')) {
        window.achievementsManager = new AchievementsManager('achievements');
        window.achievementsManager.init();
    }
});
