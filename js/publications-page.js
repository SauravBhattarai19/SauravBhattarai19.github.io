// Publications page functionality
class PublicationsPage {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = 'all';
        this.currentSort = 'year-desc';
        this.init();
    }

    async init() {
        try {
            await this.dataManager.loadData();
            this.renderFeaturedPublications();
            this.renderAllPublications();
            this.setupEventListeners();
            this.updateStats();
            this.renderMetrics();
        } catch (error) {
            console.error('Error initializing publications page:', error);
        }
    }

    renderFeaturedPublications() {
        const featuredGrid = document.getElementById('featured-publications-grid');
        if (!featuredGrid) return;

        const featuredPubs = [
            ...this.dataManager.publications.published.filter(pub => pub.featured),
            ...this.dataManager.publications.underReview.filter(pub => pub.featured)
        ].slice(0, 3);
        
        featuredGrid.innerHTML = featuredPubs.map(pub => `
            <div class="featured-pub-card" data-aos="fade-up" data-aos-delay="100">
                <div class="pub-header">
                    <div class="pub-type-badge ${pub.type}">${pub.type}</div>
                    ${pub.featured ? '<div class="featured-badge">Featured</div>' : ''}
                </div>
                <div class="pub-content">
                    <h3 class="pub-title">${pub.title}</h3>
                    <p class="pub-authors">${pub.authors}</p>
                    <p class="pub-venue">
                        ${pub.journal || pub.conference || pub.venue}
                        ${pub.year ? ` (${pub.year})` : ''}
                    </p>
                    ${pub.doi ? `
                        <div class="pub-links">
                            <a href="${pub.doi}" target="_blank" class="pub-link">
                                <i class="fas fa-external-link-alt"></i> View Publication
                            </a>
                        </div>
                    ` : ''}
                    ${pub.citations ? `
                        <div class="pub-metrics">
                            <span class="metric">
                                <i class="fas fa-quote-left"></i>
                                ${pub.citations} citations
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderAllPublications() {
        const publicationsList = document.getElementById('publications-list');
        if (!publicationsList) return;

        let allPublications = [
            ...this.dataManager.publications.published.map(pub => ({...pub, status: 'published'})),
            ...this.dataManager.publications.underReview.map(pub => ({...pub, status: 'under-review'}))
        ];

        // Apply filters
        if (this.currentFilter !== 'all') {
            allPublications = allPublications.filter(pub => {
                switch (this.currentFilter) {
                    case 'published':
                        return pub.status === 'published';
                    case 'under-review':
                        return pub.status === 'under-review';
                    case 'journal':
                        return pub.type === 'journal';
                    case 'conference':
                        return pub.type === 'conference';
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        allPublications.sort((a, b) => {
            switch (this.currentSort) {
                case 'year-desc':
                    return (b.year || 0) - (a.year || 0);
                case 'year-asc':
                    return (a.year || 0) - (b.year || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'citations':
                    return (b.citations || 0) - (a.citations || 0);
                default:
                    return 0;
            }
        });

        publicationsList.innerHTML = allPublications.map((pub, index) => `
            <div class="publication-item" data-aos="fade-up" data-aos-delay="${(index % 5) * 50}">
                <div class="pub-main">
                    <div class="pub-badges">
                        <span class="pub-type-badge ${pub.type}">${pub.type}</span>
                        <span class="pub-status-badge ${pub.status}">${pub.status.replace('-', ' ')}</span>
                        ${pub.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                    <h3 class="pub-title">${pub.title}</h3>
                    <p class="pub-authors">${pub.authors}</p>
                    <div class="pub-details">
                        <span class="pub-venue">
                            <i class="fas fa-book"></i>
                            ${pub.journal || pub.conference || pub.venue}
                        </span>
                        ${pub.year ? `
                            <span class="pub-year">
                                <i class="fas fa-calendar"></i>
                                ${pub.year}
                            </span>
                        ` : ''}
                        ${pub.volume ? `
                            <span class="pub-volume">
                                <i class="fas fa-hashtag"></i>
                                Vol. ${pub.volume}
                            </span>
                        ` : ''}
                        ${pub.pages ? `
                            <span class="pub-pages">
                                <i class="fas fa-file-alt"></i>
                                pp. ${pub.pages}
                            </span>
                        ` : ''}
                    </div>
                    ${pub.abstract ? `
                        <div class="pub-abstract">
                            <p>${pub.abstract.substring(0, 200)}${pub.abstract.length > 200 ? '...' : ''}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="pub-actions">
                    ${pub.doi ? `
                        <a href="${pub.doi}" target="_blank" class="pub-action-btn">
                            <i class="fas fa-external-link-alt"></i>
                            View
                        </a>
                    ` : ''}
                    ${pub.pdf ? `
                        <a href="${pub.pdf}" target="_blank" class="pub-action-btn">
                            <i class="fas fa-file-pdf"></i>
                            PDF
                        </a>
                    ` : ''}
                    ${pub.citations ? `
                        <div class="pub-metrics">
                            <span class="metric">
                                <i class="fas fa-quote-left"></i>
                                ${pub.citations}
                            </span>
                        </div>
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
                this.renderAllPublications();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderAllPublications();
            });
        }
    }

    updateStats() {
        const totalPubs = this.dataManager.publications.published.length + this.dataManager.publications.underReview.length;
        const journalCount = [...this.dataManager.publications.published, ...this.dataManager.publications.underReview]
            .filter(pub => pub.type === 'journal').length;
        const conferenceCount = [...this.dataManager.publications.published, ...this.dataManager.publications.underReview]
            .filter(pub => pub.type === 'conference').length;
        const reviewCount = this.dataManager.publications.underReview.length;

        document.getElementById('total-publications').textContent = totalPubs;
        document.getElementById('journal-count').textContent = journalCount;
        document.getElementById('conference-count').textContent = conferenceCount;
        document.getElementById('review-count').textContent = reviewCount;
    }

    renderMetrics() {
        // Simple publications by year chart
        const canvas = document.getElementById('publications-by-year');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const publications = [...this.dataManager.publications.published, ...this.dataManager.publications.underReview];
        
        // Group by year
        const yearCounts = {};
        publications.forEach(pub => {
            const year = pub.year || new Date().getFullYear();
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        });

        const years = Object.keys(yearCounts).sort();
        const counts = years.map(year => yearCounts[year]);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Publications',
                    data: counts,
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PublicationsPage();
});
