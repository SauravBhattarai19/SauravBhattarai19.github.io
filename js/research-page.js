// Research page functionality
class ResearchPage {
    constructor() {
        this.dataManager = new DataManager();
        this.researchData = null;
        this.init();
    }

    async init() {
        try {
            this.researchData = await this.dataManager.getResearch();
            if (this.researchData) {
                this.renderOngoingResearch();
                this.renderCompletedResearch();
                this.setupScrollControls();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error initializing research page:', error);
        }
    }

    renderOngoingResearch() {
        const ongoingGrid = document.getElementById('ongoing-research-grid');
        if (!ongoingGrid || !this.researchData) return;

        const ongoingResearch = this.researchData.filter(item => item.status === 'ongoing');
        
        if (ongoingResearch.length === 0) {
            ongoingGrid.innerHTML = '<p class="no-data">No ongoing research available.</p>';
            return;
        }
        
        ongoingGrid.innerHTML = ongoingResearch.map((research, index) => `
            <div class="ongoing-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="ongoing-image">
                    ${research.image ? 
                        `<img src="assets/research/${research.image}" alt="${research.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="placeholder-image" style="display:none;"><i class="fas fa-flask"></i></div>` :
                        `<div class="placeholder-image"><i class="fas fa-flask"></i></div>`
                    }
                    <div class="ongoing-status">Ongoing</div>
                </div>
                <div class="ongoing-content">
                    <h3 class="ongoing-title">${research.title}</h3>
                    <p class="ongoing-description">${research.description}</p>
                    
                    <div class="ongoing-meta">
                        ${research.funding ? `
                            <div class="meta-item">
                                <i class="fas fa-dollar-sign"></i>
                                <span>${research.funding}</span>
                            </div>
                        ` : ''}
                        
                        ${research.collaborators?.length > 0 ? `
                            <div class="meta-item">
                                <i class="fas fa-users"></i>
                                <span>${research.collaborators.join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="ongoing-technologies">
                        ${research.technologies?.slice(0, 5).map(tech => 
                            `<span class="tech-tag-compact">${tech}</span>`
                        ).join('') || ''}
                        ${research.technologies?.length > 5 ? `<span class="tech-tag-compact">+${research.technologies.length - 5} more</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCompletedResearch() {
        const completedScroll = document.getElementById('completed-research-scroll');
        if (!completedScroll || !this.researchData) return;

        const completedResearch = this.researchData.filter(item => item.status === 'completed');
        
        if (completedResearch.length === 0) {
            completedScroll.innerHTML = '<p class="no-data">No completed research available.</p>';
            return;
        }
        
        completedScroll.innerHTML = completedResearch.map((research, index) => `
            <div class="completed-card" data-aos="fade-up" data-aos-delay="${index * 50}">
                <div class="completed-image">
                    ${research.image ? 
                        `<img src="assets/research/${research.image}" alt="${research.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="placeholder-image" style="display:none;"><i class="fas fa-microscope"></i></div>` :
                        `<div class="placeholder-image"><i class="fas fa-microscope"></i></div>`
                    }
                    <div class="completed-status">Completed</div>
                </div>
                <div class="completed-content">
                    <h3 class="completed-title">${research.title}</h3>
                    <p class="completed-description">${research.description}</p>
                    
                    ${research.publications && research.publications.length > 0 ? `
                        <div class="completed-publications">
                            <div class="publications-count">
                                <i class="fas fa-file-alt"></i>
                                ${research.publications.length} Publication${research.publications.length > 1 ? 's' : ''}
                            </div>
                            <div class="publication-preview">
                                ${research.publications[0].substring(0, 80)}${research.publications[0].length > 80 ? '...' : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    setupScrollControls() {
        const scrollLeft = document.getElementById('scroll-left');
        const scrollRight = document.getElementById('scroll-right');
        const completedScroll = document.getElementById('completed-research-scroll');
        
        if (!scrollLeft || !scrollRight || !completedScroll) return;

        scrollLeft.addEventListener('click', () => {
            completedScroll.scrollBy({
                left: -340,
                behavior: 'smooth'
            });
        });

        scrollRight.addEventListener('click', () => {
            completedScroll.scrollBy({
                left: 340,
                behavior: 'smooth'
            });
        });

        // Update button states based on scroll position
        const updateScrollButtons = () => {
            const isAtStart = completedScroll.scrollLeft <= 0;
            const isAtEnd = completedScroll.scrollLeft >= (completedScroll.scrollWidth - completedScroll.clientWidth);
            
            scrollLeft.style.opacity = isAtStart ? '0.5' : '1';
            scrollRight.style.opacity = isAtEnd ? '0.5' : '1';
            scrollLeft.style.pointerEvents = isAtStart ? 'none' : 'all';
            scrollRight.style.pointerEvents = isAtEnd ? 'none' : 'all';
        };

        completedScroll.addEventListener('scroll', updateScrollButtons);
        updateScrollButtons(); // Initial state
    }

    updateStats() {
        // Update statistics based on actual data
        if (!this.researchData) return;
        
        const activeProjects = this.researchData.filter(r => r.status === 'ongoing').length;
        const completedProjects = this.researchData.filter(r => r.status === 'completed').length;
        
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
        if (fundingAmountEl) fundingAmountEl.textContent = `${completedProjects}`;
        if (impactAreasEl) impactAreasEl.textContent = `${totalPublications}`;
        
        // Update stat labels to be more accurate
        const impactAreasLabel = document.querySelector('#impact-areas + .stat-label');
        if (impactAreasLabel) impactAreasLabel.textContent = 'Publications';
        
        const fundingLabel = document.querySelector('#funding-amount + .stat-label');
        if (fundingLabel) fundingLabel.textContent = 'Completed Projects';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResearchPage();
});
