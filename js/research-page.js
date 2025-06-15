// Research page functionality
class ResearchPage {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.init();
    }

    async init() {
        try {
            await this.dataManager.loadData();
            this.renderFeaturedResearch();
            this.renderAllResearch();
            this.setupEventListeners();
            this.updateStats();
        } catch (error) {
            console.error('Error initializing research page:', error);
        }
    }

    renderFeaturedResearch() {
        const featuredGrid = document.getElementById('featured-research-grid');
        if (!featuredGrid) return;

        const featuredResearch = this.dataManager.research.filter(item => item.featured);
        
        featuredGrid.innerHTML = featuredResearch.map(research => `
            <div class="featured-card" data-aos="fade-up" data-aos-delay="100">
                <div class="card-image">
                    <img src="assets/research/${research.image || 'default.jpg'}" alt="${research.title}">
                    <div class="card-overlay">
                        <span class="status-badge ${research.status}">${research.status}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${research.title}</h3>
                    <p class="card-description">${research.description}</p>
                    <div class="card-technologies">
                        ${research.technologies.slice(0, 3).map(tech => 
                            `<span class="tech-tag">${tech}</span>`
                        ).join('')}
                        ${research.technologies.length > 3 ? `<span class="tech-more">+${research.technologies.length - 3} more</span>` : ''}
                    </div>
                    <div class="card-footer">
                        <div class="collaborators">
                            <i class="fas fa-users"></i>
                            <span>${research.collaborators ? research.collaborators.length : 0} Collaborators</span>
                        </div>
                        <div class="publications">
                            <i class="fas fa-file-alt"></i>
                            <span>${research.publications ? research.publications.length : 0} Publications</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAllResearch() {
        const researchGrid = document.getElementById('research-grid');
        if (!researchGrid) return;

        let filteredResearch = this.dataManager.research;

        // Apply filters
        if (this.currentFilter !== 'all') {
            filteredResearch = filteredResearch.filter(research => {
                switch (this.currentFilter) {
                    case 'ongoing':
                        return research.status === 'ongoing';
                    case 'completed':
                        return research.status === 'completed';
                    case 'featured':
                        return research.featured;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filteredResearch.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.startDate || '2024-01-01') - new Date(a.startDate || '2024-01-01');
                case 'date-asc':
                    return new Date(a.startDate || '2024-01-01') - new Date(b.startDate || '2024-01-01');
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        researchGrid.innerHTML = filteredResearch.map((research, index) => `
            <div class="research-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="card-header">
                    <div class="card-image">
                        <img src="assets/research/${research.image || 'default.jpg'}" alt="${research.title}">
                        <div class="card-overlay">
                            <span class="status-badge ${research.status}">${research.status}</span>
                            ${research.featured ? '<span class="featured-badge">Featured</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="research-title">${research.title}</h3>
                    <p class="research-description">${research.description}</p>
                    
                    <div class="research-technologies">
                        ${research.technologies.map(tech => 
                            `<span class="tech-tag">${tech}</span>`
                        ).join('')}
                    </div>
                    
                    ${research.funding ? `
                        <div class="research-funding">
                            <i class="fas fa-dollar-sign"></i>
                            <span>${research.funding}</span>
                        </div>
                    ` : ''}
                    
                    ${research.collaborators ? `
                        <div class="research-collaborators">
                            <i class="fas fa-users"></i>
                            <span>${research.collaborators.join(', ')}</span>
                        </div>
                    ` : ''}
                    
                    ${research.publications && research.publications.length > 0 ? `
                        <div class="research-publications">
                            <h4>Related Publications:</h4>
                            <ul>
                                ${research.publications.slice(0, 2).map(pub => 
                                    `<li>${pub}</li>`
                                ).join('')}
                                ${research.publications.length > 2 ? `<li>... and ${research.publications.length - 2} more</li>` : ''}
                            </ul>
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
                this.renderAllResearch();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderAllResearch();
            });
        }
    }

    updateStats() {
        // Update statistics
        const activeProjects = this.dataManager.research.filter(r => r.status === 'ongoing').length;
        const collaborations = new Set(this.dataManager.research.flatMap(r => r.collaborators || [])).size;
        
        document.getElementById('active-projects').textContent = activeProjects;
        document.getElementById('collaborations').textContent = collaborations;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResearchPage();
});
