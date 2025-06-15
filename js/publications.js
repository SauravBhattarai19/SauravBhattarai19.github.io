// Publications Module
class PublicationsManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFilter = 'all';
        this.currentSort = 'year-desc';
    }

    async init() {
        try {
            const data = await window.dataManager.getPublications();
            if (data) {
                this.renderPublications(data);
                this.addFilterControls();
            }
        } catch (error) {
            console.error('Error initializing publications:', error);
            this.renderError();
        }
    }

    renderPublications(data) {
        const publications = [...data.published, ...data.under_review.map(pub => ({...pub, status: 'under_review'}))];
        const filtered = this.filterPublications(publications);
        const sorted = this.sortPublications(filtered);

        const html = `
            <div class="publications-header">
                <h2>Publications</h2>
                <div class="publications-controls">
                    <div class="filter-controls">
                        <select id="publication-filter" onchange="publicationsManager.setFilter(this.value)">
                            <option value="all">All Publications</option>
                            <option value="published">Published</option>
                            <option value="under_review">Under Review</option>
                            <option value="featured">Featured</option>
                        </select>
                    </div>
                    <div class="sort-controls">
                        <select id="publication-sort" onchange="publicationsManager.setSort(this.value)">
                            <option value="year-desc">Newest First</option>
                            <option value="year-asc">Oldest First</option>
                            <option value="title">By Title</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="publications-stats">
                <span class="stat-item">Total: ${publications.length}</span>
                <span class="stat-item">Published: ${data.published.length}</span>
                <span class="stat-item">Under Review: ${data.under_review.length}</span>
            </div>
            <div class="publications-grid">
                ${sorted.map(pub => this.renderPublicationCard(pub)).join('')}
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderPublicationCard(pub) {
        const statusClass = pub.status === 'under_review' ? 'status-review' : 'status-published';
        const featuredClass = pub.featured ? 'featured' : '';
        const statusText = pub.status === 'under_review' ? 'Under Review' : 'Published';

        return `
            <div class="publication-card ${featuredClass}" data-aos="fade-up">
                <div class="publication-header">
                    <span class="publication-year">${pub.year}</span>
                    <span class="publication-status ${statusClass}">${statusText}</span>
                    ${pub.featured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
                <h3 class="publication-title">${pub.title}</h3>
                <p class="publication-authors">${pub.authors}</p>
                <div class="publication-venue">
                    <strong>${pub.journal}</strong>
                    ${pub.volume ? `Vol. ${pub.volume}` : ''}
                    ${pub.pages ? `, ${pub.pages}` : ''}
                </div>
                <div class="publication-actions">
                    ${pub.doi ? `<a href="${pub.doi}" target="_blank" class="btn btn-primary btn-sm">
                        <i class="fas fa-external-link-alt"></i> View Publication
                    </a>` : ''}
                    ${pub.pdf ? `<a href="./assets/publications/${pub.pdf}" target="_blank" class="btn btn-secondary btn-sm">
                        <i class="fas fa-file-pdf"></i> PDF
                    </a>` : ''}
                </div>
            </div>
        `;
    }

    filterPublications(publications) {
        switch (this.currentFilter) {
            case 'published':
                return publications.filter(pub => pub.status !== 'under_review');
            case 'under_review':
                return publications.filter(pub => pub.status === 'under_review');
            case 'featured':
                return publications.filter(pub => pub.featured);
            default:
                return publications;
        }
    }

    sortPublications(publications) {
        switch (this.currentSort) {
            case 'year-asc':
                return publications.sort((a, b) => parseInt(a.year) - parseInt(b.year));
            case 'title':
                return publications.sort((a, b) => a.title.localeCompare(b.title));
            default: // year-desc
                return publications.sort((a, b) => parseInt(b.year) - parseInt(a.year));
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

    addFilterControls() {
        const filterSelect = document.getElementById('publication-filter');
        const sortSelect = document.getElementById('publication-sort');
        
        if (filterSelect) filterSelect.value = this.currentFilter;
        if (sortSelect) sortSelect.value = this.currentSort;
    }

    renderError() {
        this.container.innerHTML = `
            <div class="error-message">
                <h3>Unable to load publications</h3>
                <p>Please try refreshing the page or contact the site administrator.</p>
            </div>
        `;
    }

    async refresh() {
        await window.dataManager.refreshData('publications.json');
        this.init();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('publications')) {
        window.publicationsManager = new PublicationsManager('publications');
        window.publicationsManager.init();
    }
});
