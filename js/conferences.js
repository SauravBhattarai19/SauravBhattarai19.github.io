// Conferences Module
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

        const html = `
            <div class="conferences-header">
                <h2>Conference Presentations</h2>
                <div class="conferences-controls">
                    <div class="filter-controls">
                        <select id="conference-filter" onchange="conferencesManager.setFilter(this.value)">
                            <option value="all">All Presentations</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="presented">Presented</option>
                            <option value="oral">Oral Presentations</option>
                            <option value="poster">Poster Presentations</option>
                        </select>
                    </div>
                    <div class="sort-controls">
                        <select id="conference-sort" onchange="conferencesManager.setSort(this.value)">
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="conference">By Conference</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="conferences-timeline">
                ${this.renderTimeline(sorted)}
            </div>
        `;

        this.container.innerHTML = html;
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
        const statusClass = conf.status === 'upcoming' ? 'status-upcoming' : 'status-presented';
        const typeClass = conf.type.toLowerCase().includes('oral') ? 'type-oral' : 'type-poster';

        return `
            <div class="conference-card ${statusClass}" data-aos="fade-left">
                <div class="conference-header">
                    <div class="conference-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(conf.date)}
                    </div>
                    <div class="conference-badges">
                        <span class="conference-type ${typeClass}">${conf.type}</span>
                        <span class="conference-status ${statusClass}">${conf.status}</span>
                    </div>
                </div>
                
                <h4 class="conference-title">${conf.title}</h4>
                <p class="conference-authors">${conf.authors}</p>
                
                <div class="conference-details">
                    <div class="conference-venue">
                        <i class="fas fa-university"></i>
                        <strong>${conf.conference}</strong>
                    </div>
                    <div class="conference-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${conf.location}
                    </div>
                </div>
                
                <div class="conference-actions">
                    ${conf.abstract ? `
                        <button onclick="conferencesManager.showAbstract('${conf.title}')" class="btn btn-primary btn-sm">
                            <i class="fas fa-file-text"></i> Abstract
                        </button>
                    ` : ''}
                    ${conf.slides ? `
                        <a href="./assets/conferences/${conf.slides}" target="_blank" class="btn btn-secondary btn-sm">
                            <i class="fas fa-presentation"></i> Slides
                        </a>
                    ` : ''}
                    ${conf.poster ? `
                        <a href="./assets/conferences/${conf.poster}" target="_blank" class="btn btn-secondary btn-sm">
                            <i class="fas fa-image"></i> Poster
                        </a>
                    ` : ''}
                    ${conf.video ? `
                        <a href="${conf.video}" target="_blank" class="btn btn-secondary btn-sm">
                            <i class="fas fa-video"></i> Video
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
        try {
            // Handle different date formats
            if (dateString.includes('-')) {
                // Range format like "Dec 9-13, 2024"
                return dateString;
            }
            return dateString;
        } catch (error) {
            return dateString;
        }
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
                return conferences.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'conference':
                return conferences.sort((a, b) => a.conference.localeCompare(b.conference));
            default: // date-desc
                return conferences.sort((a, b) => new Date(b.date) - new Date(a.date));
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

    showAbstract(title) {
        // This would show the abstract in a modal
        alert(`Abstract for "${title}" would be displayed here. This can be implemented as a modal with the full abstract text.`);
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
