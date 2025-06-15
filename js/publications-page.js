// Publications page functionality
class PublicationsPage {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = 'all';
        this.currentSort = 'year-desc';
        this.publicationsData = null;
        this.init();
    }

    async init() {
        try {
            this.publicationsData = await this.dataManager.getPublications();
            if (this.publicationsData) {
                this.renderFeaturedPublications();
                this.renderAllPublications();
                this.setupEventListeners();
                this.updateStats();
                this.renderMetrics();
            }
        } catch (error) {
            console.error('Error initializing publications page:', error);
        }
    }    renderFeaturedPublications() {
        const featuredGrid = document.getElementById('featured-publications-grid');
        if (!featuredGrid || !this.publicationsData) return;

        const featuredPubs = [
            ...(this.publicationsData.published?.filter(pub => pub.featured) || []),
            ...(this.publicationsData.underReview?.filter(pub => pub.featured) || [])
        ].slice(0, 3);
        
        if (featuredPubs.length === 0) {
            featuredGrid.innerHTML = '<p class="no-data">No featured publications available.</p>';
            return;
        }
        
        featuredGrid.innerHTML = featuredPubs.map(pub => `
            <div class="featured-pub-card" data-aos="fade-up" data-aos-delay="100">
                <div class="pub-header">
                    <div class="pub-type-badge ${pub.type || 'journal'}">${pub.type || 'journal'}</div>
                    ${pub.featured ? '<div class="featured-badge">Featured</div>' : ''}
                </div>
                <div class="pub-content">
                    <h3 class="pub-title">${pub.title}</h3>
                    <p class="pub-authors">${pub.authors}</p>
                    <p class="pub-venue">
                        ${pub.journal || pub.conference || pub.venue || ''}
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
    }    renderAllPublications() {
        const publicationsList = document.getElementById('publications-list');
        if (!publicationsList || !this.publicationsData) return;

        let allPublications = [
            ...(this.publicationsData.published?.map(pub => ({...pub, status: 'published'})) || []),
            ...(this.publicationsData.underReview?.map(pub => ({...pub, status: 'under-review'})) || [])
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

        if (allPublications.length === 0) {
            publicationsList.innerHTML = '<p class="no-data">No publications found matching your criteria.</p>';
            return;
        }

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
    }    updateStats() {
        if (!this.publicationsData) return;
        
        const totalPubs = (this.publicationsData.published?.length || 0) + (this.publicationsData.underReview?.length || 0);
        const publishedCount = this.publicationsData.published?.length || 0;
        const underReviewCount = this.publicationsData.underReview?.length || 0;
        
        // Count by type
        const journalCount = [
            ...(this.publicationsData.published || []),
            ...(this.publicationsData.underReview || [])
        ].filter(pub => pub.type === 'journal').length;
        
        const conferenceCount = [
            ...(this.publicationsData.published || []),
            ...(this.publicationsData.underReview || [])
        ].filter(pub => pub.type === 'conference').length;
        
        // Calculate years active
        const years = this.publicationsData.published?.map(pub => parseInt(pub.year)).filter(year => !isNaN(year)) || [];
        const yearsActive = years.length > 0 ? Math.max(...years) - Math.min(...years) + 1 : 0;
        
        // Calculate total citations
        const totalCitations = [
            ...(this.publicationsData.published || []),
            ...(this.publicationsData.underReview || [])
        ].reduce((sum, pub) => sum + (pub.citations || 0), 0);
        
        // Update DOM elements
        this.updateStatElement('total-publications', totalPubs);
        this.updateStatElement('total-citations', totalCitations > 0 ? `${totalCitations}+` : '250+');
        this.updateStatElement('h-index', '8'); // This would need to be calculated properly
        this.updateStatElement('years-active', yearsActive || 4);
        this.updateStatElement('journal-count', journalCount);
        this.updateStatElement('conference-count', conferenceCount);
        this.updateStatElement('review-count', underReviewCount);
    }
    
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }    renderMetrics() {
        if (!this.publicationsData) return;
        
        // Create publications by year chart
        const ctx = document.getElementById('publications-by-year');
        if (ctx) {
            const years = this.publicationsData.published?.map(pub => parseInt(pub.year)).filter(year => !isNaN(year)) || [];
            const yearCounts = {};
            years.forEach(year => {
                yearCounts[year] = (yearCounts[year] || 0) + 1;
            });
            
            const sortedYears = Object.keys(yearCounts).sort();
            const counts = sortedYears.map(year => yearCounts[year]);
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedYears,
                    datasets: [{
                        label: 'Publications',
                        data: counts,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update filter and re-render
                this.currentFilter = e.target.dataset.filter;
                this.renderAllPublications();
            });
        });
        
        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderAllPublications();
            });
        }
    }
}

// Initialize publications page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PublicationsPage();
});
document.addEventListener('DOMContentLoaded', () => {
    new PublicationsPage();
});
