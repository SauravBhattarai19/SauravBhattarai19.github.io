// Enhanced Conferences Module with Modern Design
class ConferencesManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
    }

    async init() {
        try {
            const conferences = await window.dataManager.getConferences();
            if (conferences) {
                this.renderConferences(conferences);
            }
        } catch (error) {
            console.error('Error initializing conferences:', error);
            this.renderError();
        }
    }

    renderConferences(conferences) {
        const filtered = this.filterConferences(conferences);
        const sorted = this.sortConferences(filtered);
        const stats = this.calculateStats(conferences);

        const html = `
            <div class="conferences-header">
                <h2>Conference Presentations</h2>
                <p class="conferences-subtitle">
                    Sharing research insights through presentations at leading international conferences
                </p>
            </div>

            <div class="conferences-controls">
                <div class="filter-group">
                    <label>Filter by:</label>
                    <select id="conference-filter" onchange="conferencesManager.setFilter(this.value)">
                        <option value="all">All Presentations</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="presented">Presented</option>
                        <option value="oral">Oral Presentations</option>
                        <option value="poster">Poster Presentations</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Sort by:</label>
                    <select id="conference-sort" onchange="conferencesManager.setSort(this.value)">
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="conference">By Conference</option>
                    </select>
                </div>
            </div>

            <div class="conferences-stats">
                <div class="stat-card">
                    <span class="stat-number">${stats.total}</span>
                    <span class="stat-label">Total Presentations</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${stats.upcoming}</span>
                    <span class="stat-label">Upcoming</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${stats.oral}</span>
                    <span class="stat-label">Oral Presentations</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${stats.poster}</span>
                    <span class="stat-label">Poster Presentations</span>
                </div>
            </div>

            <div class="conferences-timeline">
                ${this.renderTimeline(sorted)}
            </div>
        `;

        this.container.innerHTML = html;
        this.addFilterListeners();
    }

    calculateStats(conferences) {
        return {
            total: conferences.length,
            upcoming: conferences.filter(c => c.status === 'upcoming').length,
            oral: conferences.filter(c => c.type.toLowerCase().includes('oral')).length,
            poster: conferences.filter(c => c.type.toLowerCase().includes('poster')).length
        };
    }

    renderTimeline(conferences) {
        const groupedByYear = this.groupByYear(conferences);
        
        return Object.keys(groupedByYear)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map(year => `
                <div class="timeline-year" data-aos="fade-up">
                    <h3 class="year-header">${year}</h3>
                    <div class="timeline-items">
                        ${groupedByYear[year].map(conf => this.renderConferenceCard(conf)).join('')}
                    </div>
                </div>
            `).join('');
    }

    renderConferenceCard(conf) {
        const statusClass = conf.status === 'upcoming' ? 'upcoming' : 'presented';
        const typeClass = conf.type.toLowerCase().includes('oral') ? 'oral' : 'poster';

        return `
            <div class="conference-card" data-aos="fade-left" data-aos-delay="100">
                <div class="conference-header">
                    <div class="conference-meta">
                        <div class="conference-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(conf.date)}
                        </div>
                        <div class="conference-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${conf.location}
                        </div>
                    </div>
                    <div class="conference-badges">
                        <span class="badge badge-type badge-${typeClass}">${conf.type}</span>
                        <span class="badge badge-${statusClass}">${conf.status === 'upcoming' ? 'Upcoming' : 'Presented'}</span>
                    </div>
                </div>
                
                <h4 class="conference-title">${conf.title}</h4>
                <p class="conference-authors">${conf.authors}</p>
                
                <div class="conference-venue">
                    <i class="fas fa-university"></i>
                    <strong>${conf.conference}</strong>
                </div>
                
                <div class="conference-actions">
                    ${conf.abstract ? `
                        <button onclick="conferencesManager.showAbstract('${this.escapeQuotes(conf.title)}')" class="btn-conference btn-primary">
                            <i class="fas fa-file-text"></i> Abstract
                        </button>
                    ` : ''}
                    ${conf.slides ? `
                        <a href="./assets/conferences/${conf.slides}" target="_blank" class="btn-conference btn-secondary">
                            <i class="fas fa-presentation"></i> Slides
                        </a>
                    ` : ''}
                    ${conf.poster ? `
                        <a href="./assets/conferences/${conf.poster}" target="_blank" class="btn-conference btn-secondary">
                            <i class="fas fa-image"></i> Poster
                        </a>
                    ` : ''}
                    ${conf.video ? `
                        <a href="${conf.video}" target="_blank" class="btn-conference btn-secondary">
                            <i class="fas fa-video"></i> Recording
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }

    groupByYear(conferences) {
        return conferences.reduce((groups, conf) => {
            const year = conf.year;
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(conf);
            return groups;
        }, {});
    }

    formatDate(dateString) {
        return dateString;
    }

    escapeQuotes(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    filterConferences(conferences) {
        switch (this.currentFilter) {
            case 'upcoming':
                return conferences.filter(conf => conf.status === 'upcoming');
            case 'presented':
                return conferences.filter(conf => conf.status === 'presented');
            case 'oral':
                return conferences.filter(conf => conf.type.toLowerCase().includes('oral'));
            case 'poster':
                return conferences.filter(conf => conf.type.toLowerCase().includes('poster'));
            default:
                return conferences;
        }
    }

    sortConferences(conferences) {
        switch (this.currentSort) {
            case 'date-asc':
                return conferences.sort((a, b) => parseInt(a.year) - parseInt(b.year));
            case 'conference':
                return conferences.sort((a, b) => a.conference.localeCompare(b.conference));
            default: // date-desc
                return conferences.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.init();
    }

    setSort(sort) {
        this.currentSort = sort;
        this.init();
    }

    addFilterListeners() {
        const filterSelect = document.getElementById('conference-filter');
        const sortSelect = document.getElementById('conference-sort');
        
        if (filterSelect) filterSelect.value = this.currentFilter;
        if (sortSelect) sortSelect.value = this.currentSort;
    }

    showAbstract(title) {
        // Enhanced modal functionality would go here
        this.showModal(`
            <div class="modal-content">
                <h3>Abstract: ${title}</h3>
                <p>Abstract content would be displayed here. This can be expanded to show full abstract text from the conference data.</p>
                <button onclick="conferencesManager.closeModal()" class="btn-conference btn-primary">Close</button>
            </div>
        `);
    }

    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'conference-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="conferencesManager.closeModal()">
                <div class="modal-dialog" onclick="event.stopPropagation()">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.querySelector('.conference-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    renderError() {
        this.container.innerHTML = `
            <div class="error-message">
                <h3>Unable to load conference presentations</h3>
                <p>Please try refreshing the page or contact the site administrator.</p>
            </div>
        `;
    }

    async refresh() {
        await window.dataManager.refreshData('conferences.json');
        this.init();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('conferences')) {
        window.conferencesManager = new ConferencesManager('conferences');
        window.conferencesManager.init();
    }
});
