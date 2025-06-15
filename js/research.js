// Research Module
class ResearchManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFilter = 'all';
        this.currentView = 'grid';
    }

    async init() {
        try {
            const research = await window.dataManager.getResearch();
            if (research) {
                this.renderResearch(research);
            }
        } catch (error) {
            console.error('Error initializing research:', error);
            this.renderError();
        }
    }

    renderResearch(research) {
        const filtered = this.filterResearch(research);

        const html = `
            <div class="research-header">
                <h2>Research Projects</h2>
                <div class="research-controls">
                    <div class="filter-controls">
                        <select id="research-filter" onchange="researchManager.setFilter(this.value)">
                            <option value="all">All Projects</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="featured">Featured</option>
                        </select>
                    </div>
                    <div class="view-controls">
                        <button onclick="researchManager.setView('grid')" class="btn btn-sm ${this.currentView === 'grid' ? 'active' : ''}">
                            <i class="fas fa-th"></i> Grid
                        </button>
                        <button onclick="researchManager.setView('list')" class="btn btn-sm ${this.currentView === 'list' ? 'active' : ''}">
                            <i class="fas fa-list"></i> List
                        </button>
                    </div>
                </div>
            </div>
            <div class="research-${this.currentView}">
                ${filtered.map(project => this.renderResearchCard(project)).join('')}
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderResearchCard(project) {
        const statusClass = project.status === 'ongoing' ? 'status-ongoing' : 'status-completed';
        const featuredClass = project.featured ? 'featured' : '';

        if (this.currentView === 'list') {
            return this.renderResearchListItem(project);
        }

        return `
            <div class="research-card ${featuredClass}" data-aos="fade-up">
                <div class="research-image">
                    ${project.image ? 
                        `<img src="./assets/research/${project.image}" alt="${project.title}" onerror="this.src='./assets/research/default.jpg'">` : 
                        '<div class="placeholder-image"><i class="fas fa-flask"></i></div>'
                    }
                    <div class="research-overlay">
                        <span class="research-status ${statusClass}">${project.status}</span>
                        ${project.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                </div>
                <div class="research-content">
                    <h3 class="research-title">${project.title}</h3>
                    <p class="research-description">${project.description}</p>
                    
                    <div class="research-details">
                        <div class="technologies">
                            <strong>Technologies:</strong>
                            <div class="tech-tags">
                                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            </div>
                        </div>
                        
                        ${project.funding ? `
                            <div class="funding">
                                <strong>Funding:</strong> ${project.funding}
                            </div>
                        ` : ''}
                        
                        ${project.collaborators ? `
                            <div class="collaborators">
                                <strong>Collaborators:</strong> ${project.collaborators.join(', ')}
                            </div>
                        ` : ''}
                        
                        ${project.publications && project.publications.length > 0 ? `
                            <div class="related-publications">
                                <strong>Related Publications:</strong>
                                <ul>
                                    ${project.publications.map(pub => `<li>${pub}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="research-actions">
                        <button onclick="researchManager.showDetails('${project.title}')" class="btn btn-primary btn-sm">
                            <i class="fas fa-info-circle"></i> More Details
                        </button>
                        ${project.github ? `
                            <a href="${project.github}" target="_blank" class="btn btn-secondary btn-sm">
                                <i class="fab fa-github"></i> Code
                            </a>
                        ` : ''}
                        ${project.demo ? `
                            <a href="${project.demo}" target="_blank" class="btn btn-secondary btn-sm">
                                <i class="fas fa-external-link-alt"></i> Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderResearchListItem(project) {
        const statusClass = project.status === 'ongoing' ? 'status-ongoing' : 'status-completed';
        
        return `
            <div class="research-list-item" data-aos="fade-up">
                <div class="research-list-header">
                    <h3 class="research-title">${project.title}</h3>
                    <span class="research-status ${statusClass}">${project.status}</span>
                </div>
                <p class="research-description">${project.description}</p>
                <div class="research-meta">
                    <span class="tech-count">${project.technologies.length} Technologies</span>
                    ${project.publications ? `<span class="pub-count">${project.publications.length} Publications</span>` : ''}
                    ${project.funding ? `<span class="funding-info">${project.funding}</span>` : ''}
                </div>
            </div>
        `;
    }

    filterResearch(research) {
        switch (this.currentFilter) {
            case 'ongoing':
                return research.filter(project => project.status === 'ongoing');
            case 'completed':
                return research.filter(project => project.status === 'completed');
            case 'featured':
                return research.filter(project => project.featured);
            default:
                return research;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.init();
    }

    setView(view) {
        this.currentView = view;
        this.init();
    }

    showDetails(title) {
        // This would open a modal or navigate to a detailed page
        // For now, we'll show an alert
        alert(`Detailed view for "${title}" would open here. This can be implemented as a modal or separate page.`);
    }

    renderError() {
        this.container.innerHTML = `
            <div class="error-message">
                <h3>Unable to load research projects</h3>
                <p>Please try refreshing the page or contact the site administrator.</p>
            </div>
        `;
    }

    async refresh() {
        await window.dataManager.refreshData('research.json');
        this.init();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('research')) {
        window.researchManager = new ResearchManager('research');
        window.researchManager.init();
    }
});
