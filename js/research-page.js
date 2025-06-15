// Research page functionality
class ResearchPage {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.researchData = null;
        this.init();
    }

    async init() {
        try {
            this.researchData = await this.dataManager.getResearch();
            if (this.researchData) {
                this.renderFeaturedResearch();
                this.renderAllResearch();
                this.setupEventListeners();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error initializing research page:', error);
        }
    }    renderFeaturedResearch() {
        const featuredGrid = document.getElementById('featured-research-grid');
        if (!featuredGrid || !this.researchData) return;

        const featuredResearch = this.researchData.filter(item => item.featured);
        
        if (featuredResearch.length === 0) {
            featuredGrid.innerHTML = '<p class="no-data">No featured research available.</p>';
            return;
        }
        
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

        let filteredResearch = this.researchData || [];

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
        });        researchGrid.innerHTML = filteredResearch.map((research, index) => `
            <div class="research-card ${research.featured ? 'featured' : ''}" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="research-image">
                    ${research.image ? 
                        `<img src="assets/research/${research.image}" alt="${research.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="placeholder-image" style="display:none;"><i class="fas fa-flask"></i></div>` :
                        `<div class="placeholder-image"><i class="fas fa-flask"></i></div>`
                    }
                    <div class="research-overlay">
                        <span class="research-status status-${research.status}">${research.status}</span>
                        ${research.featured ? '<span class="featured-tag"><i class="fas fa-star"></i> Featured</span>' : ''}
                    </div>
                </div>
                <div class="research-content">
                    <h3 class="research-title">${research.title}</h3>
                    <p class="research-description">${research.description}</p>
                    
                    <div class="research-technologies">
                        ${research.technologies?.slice(0, 4).map(tech => 
                            `<span class="tech-tag">${tech}</span>`
                        ).join('') || ''}
                        ${research.technologies?.length > 4 ? `<span class="tech-more">+${research.technologies.length - 4}</span>` : ''}
                    </div>
                    
                    <div class="research-details">
                        ${research.funding ? `
                            <div class="detail-item">
                                <i class="fas fa-dollar-sign"></i>
                                <span class="detail-text">${research.funding}</span>
                            </div>
                        ` : ''}
                        
                        ${research.collaborators?.length > 0 ? `
                            <div class="detail-item">
                                <i class="fas fa-users"></i>
                                <span class="detail-text">${research.collaborators.length} Collaborator${research.collaborators.length > 1 ? 's' : ''}</span>
                            </div>
                        ` : ''}
                        
                        ${research.publications?.length > 0 ? `
                            <div class="detail-item">
                                <i class="fas fa-file-alt"></i>
                                <span class="detail-text">${research.publications.length} Publication${research.publications.length > 1 ? 's' : ''}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${research.publications && research.publications.length > 0 ? `
                        <div class="research-publications">
                            <div class="publications-header">
                                <i class="fas fa-scroll"></i>
                                <span>Key Publications</span>
                            </div>
                            <div class="publications-list">
                                ${research.publications.slice(0, 2).map(pub => 
                                    `<div class="publication-item">${pub}</div>`
                                ).join('')}
                                ${research.publications.length > 2 ? `<div class="publication-more">+${research.publications.length - 2} more publications</div>` : ''}
                            </div>
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
    }    updateStats() {
        // Update statistics based on actual data
        if (!this.researchData) return;
        
        const activeProjects = this.researchData.filter(r => r.status === 'ongoing').length;
        const completedProjects = this.researchData.filter(r => r.status === 'completed').length;
        const totalProjects = this.researchData.length;
        
        // Get unique collaborators
        const allCollaborators = this.researchData.flatMap(r => r.collaborators || []);
        const uniqueCollaborators = new Set(allCollaborators).size;
        
        // Count total publications from research
        const totalPublications = this.researchData.reduce((sum, r) => sum + (r.publications?.length || 0), 0);
        
        // Update DOM elements
        const activeProjectsEl = document.getElementById('active-projects');
        const collaborationsEl = document.getElementById('collaborations');
        const fundingAmountEl = document.getElementById('funding-amount');
        const impactAreasEl = document.getElementById('impact-areas');
        
        if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;
        if (collaborationsEl) collaborationsEl.textContent = uniqueCollaborators;
        if (fundingAmountEl) fundingAmountEl.textContent = `${totalProjects}+`;
        if (impactAreasEl) impactAreasEl.textContent = `${totalPublications}`;
        
        // Update stat labels to be more accurate
        const impactAreasLabel = document.querySelector('#impact-areas + .stat-label');
        if (impactAreasLabel) impactAreasLabel.textContent = 'Publications';
        
        const fundingLabel = document.querySelector('#funding-amount + .stat-label');
        if (fundingLabel) fundingLabel.textContent = 'Research Projects';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResearchPage();
});
