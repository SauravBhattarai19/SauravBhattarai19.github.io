// Conferences page functionality
class ConferencesPage {
    constructor() {
        this.dataManager = new DataManager();        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.conferencesData = null;
        this.map = null;
        this.init();
    }

    async init() {
        try {
            this.conferencesData = await this.dataManager.getConferences();
            if (this.conferencesData) {                this.renderUpcomingConferences();
                this.renderRecentPresentations();
                this.renderAllConferences();
                this.setupEventListeners();
                this.updateStats();
                this.initializeMap();
            }
        } catch (error) {
            console.error('Error initializing conferences page:', error);
        }
    }    renderUpcomingConferences() {
        const upcomingGrid = document.getElementById('upcoming-conferences-grid');
        if (!upcomingGrid) return;

        const currentDate = new Date();
        const upcoming = (this.conferencesData || []).filter(conf => 
            conf.status === 'upcoming' || new Date(conf.date) > currentDate
        ).slice(0, 3);

        upcomingGrid.innerHTML = upcoming.length > 0 ? upcoming.map((conf, index) => `
            <div class="upcoming-conference-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="conf-header">
                    <div class="conf-date">
                        <div class="date-month">${new Date(conf.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div class="date-day">${new Date(conf.date).getDate()}</div>
                        <div class="date-year">${new Date(conf.date).getFullYear()}</div>
                    </div>
                    <div class="conf-type-badge ${conf.type?.toLowerCase().replace(/\s+/g, '-') || 'presentation'}">${conf.type || 'Presentation'}</div>
                </div>
                <div class="conf-content">
                    <h3 class="conf-title">${conf.title}</h3>                    <p class="conf-event">${conf.conference}</p>
                    <div class="conf-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${this.formatLocation(conf)}
                    </div>
                    <div class="conf-authors">
                        <i class="fas fa-users"></i>
                        ${conf.authors}
                    </div>
                </div>
                <div class="conf-countdown">
                    <span class="countdown-label">In</span>
                    <span class="countdown-value">${this.getDaysUntil(conf.date)} days</span>
                </div>
            </div>
        `).join('') : `
            <div class="no-upcoming" data-aos="fade-up">
                <i class="fas fa-calendar-plus"></i>
                <p>No upcoming conferences scheduled</p>
            </div>
        `;
    }    renderRecentPresentations() {
        const timeline = document.getElementById('recent-presentations-timeline');
        if (!timeline) return;

        const currentDate = new Date();        const recent = (this.conferencesData || [])
            .filter(conf => conf.status === 'presented' || new Date(conf.date) <= currentDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);        timeline.innerHTML = recent.map((conf, index) => `
            <div class="recent-presentation-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="presentation-header">
                    <div class="presentation-date">
                        <span class="date-month">${new Date(conf.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span class="date-year">${new Date(conf.date).getFullYear()}</span>
                    </div>
                    <div class="presentation-badges">
                        <span class="type-badge ${conf.type?.toLowerCase().replace(/\s+/g, '-') || 'presentation'}">
                            ${conf.type?.includes('Invited') ? '<i class="fas fa-star"></i> ' : ''}${conf.type || 'Presentation'}
                        </span>
                        ${conf.award ? `<span class="award-badge"><i class="fas fa-trophy"></i> ${conf.award}</span>` : ''}
                    </div>
                </div>
                <div class="presentation-content">
                    <h4 class="presentation-title">${conf.title}</h4>
                    <div class="presentation-details">
                        <div class="detail-item">
                            <i class="fas fa-university"></i>
                            <span>${conf.conference}</span>
                        </div>                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${this.formatLocation(conf)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>${conf.authors}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAllConferences() {
        const conferencesList = document.getElementById('conferences-list');
        if (!conferencesList) return;

        let filteredConferences = this.conferencesData || [];        // Apply filters
        if (this.currentFilter !== 'all') {
            const originalCount = filteredConferences.length;
            filteredConferences = filteredConferences.filter(conf => {
                if (!conf.type) return false;
                
                const typeNormalized = conf.type.toLowerCase();
                let matches = false;
                
                switch (this.currentFilter) {
                    case 'keynote':
                        matches = typeNormalized.includes('keynote');
                        break;
                    case 'invited':
                        matches = typeNormalized.includes('invited');
                        break;
                    case 'oral':
                        matches = typeNormalized.includes('oral') && !typeNormalized.includes('poster');
                        break;
                    case 'poster':
                        matches = typeNormalized.includes('poster');
                        break;
                    case 'online':
                        matches = typeNormalized.includes('online');
                        break;
                    default:
                        matches = true;
                }
                
                return matches;
            });
            
            console.log(`Filter "${this.currentFilter}": ${originalCount} → ${filteredConferences.length} conferences`);
            console.log('Available types:', this.conferencesData.map(c => c.type));
        }

        // Apply sorting
        filteredConferences.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'location':
                    return a.location.localeCompare(b.location);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        conferencesList.innerHTML = filteredConferences.map((conf, index) => `
            <div class="conference-item" data-aos="fade-up" data-aos-delay="${(index % 4) * 50}">
                <div class="conf-main">
                    <div class="conf-header">
                        <div class="conf-date-badge">
                            <i class="fas fa-calendar"></i>
                            ${new Date(conf.date).toLocaleDateString()}
                        </div>                        <div class="conf-badges">
                            <span class="conf-type-badge ${this.getTypeCssClass(conf.type)}">${conf.type || 'Presentation'}</span>
                            ${conf.award ? `<span class="award-badge"><i class="fas fa-trophy"></i> ${conf.award}</span>` : ''}
                        </div>
                    </div>
                    <h3 class="conf-title">${conf.title}</h3>
                    <p class="conf-event">${conf.conference}</p>
                    <div class="conf-details">
                        <div class="conf-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${conf.location}
                        </div>
                        ${conf.coAuthors ? `
                            <div class="conf-authors">
                                <i class="fas fa-users"></i>
                                Co-authors: ${conf.coAuthors.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                    ${conf.abstract ? `
                        <div class="conf-abstract">
                            <p>${conf.abstract}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="conf-actions">
                    ${conf.slides ? `
                        <a href="${conf.slides}" target="_blank" class="conf-action-btn">
                            <i class="fas fa-presentation"></i>
                            Slides
                        </a>
                    ` : ''}
                    ${conf.video ? `
                        <a href="${conf.video}" target="_blank" class="conf-action-btn">
                            <i class="fas fa-video"></i>
                            Video
                        </a>
                    ` : ''}
                    ${conf.paper ? `
                        <a href="${conf.paper}" target="_blank" class="conf-action-btn">
                            <i class="fas fa-file-pdf"></i>
                            Paper
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                console.log('Filter changed to:', this.currentFilter);
                this.renderAllConferences();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                console.log('Sort changed to:', this.currentSort);
                this.renderAllConferences();
            });
        }
    }updateStats() {
        if (!this.conferencesData || this.conferencesData.length === 0) {
            document.getElementById('total-presentations').textContent = '0';
            document.getElementById('countries-visited').textContent = '0';
            document.getElementById('awards-received').textContent = '0';
            return;
        }

        // Calculate total presentations
        const totalPresentations = this.conferencesData.length;

        // Calculate unique countries visited
        const countries = new Set();
        this.conferencesData.forEach(conf => {
            // Try to get country from the new 'country' field first
            if (conf.country) {
                countries.add(conf.country.trim());
            } 
            // Fallback to parsing from location field for backward compatibility
            else if (conf.location) {
                const locationParts = conf.location.split(',');
                if (locationParts.length >= 2) {
                    // Get the last part which should be state/country
                    const lastPart = locationParts[locationParts.length - 1].trim();
                    // If it looks like a US state, count as USA
                    const usStates = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'DC', 'Washington DC'];
                    if (usStates.some(state => lastPart.includes(state))) {
                        countries.add('USA');
                    } else {
                        countries.add(lastPart);
                    }
                }
            }
        });

        // Calculate awards received
        const awards = this.conferencesData.filter(conf => conf.award && conf.award.trim() !== '').length;

        // Update the display
        document.getElementById('total-presentations').textContent = totalPresentations;
        document.getElementById('countries-visited').textContent = countries.size;
        document.getElementById('awards-received').textContent = awards;

        // Optional: Log the countries for debugging
        console.log('Countries visited:', Array.from(countries).sort());
    }

    getDaysUntil(date) {
        const now = new Date();
        const target = new Date(date);
        const diffTime = target - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }    getTypeIcon(type) {
        if (!type) return 'fa-microphone';
        
        const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
        switch (normalizedType) {
            case 'keynote':
            case 'keynote-presentation':
                return 'fa-microphone-alt';
            case 'invited':
            case 'invited-talk':
                return 'fa-user-friends';
            case 'oral':
            case 'oral-presentation':
                return 'fa-comments';
            case 'poster':
            case 'poster-presentation':
                return 'fa-image';
            default:
                return 'fa-microphone';
        }
    }    getTypeCssClass(type) {
        if (!type) return 'presentation';
        
        const typeNormalized = type.toLowerCase().replace(/\s+/g, '-');
        
        if (typeNormalized.includes('keynote')) return 'keynote-presentation';
        if (typeNormalized.includes('invited')) return 'invited-presentation';
        if (typeNormalized.includes('online') && typeNormalized.includes('poster')) return 'online-poster-presentation';
        if (typeNormalized.includes('online')) return 'online-presentation';
        if (typeNormalized.includes('oral')) return 'oral-presentation';
        if (typeNormalized.includes('poster')) return 'poster-presentation';
        
        return typeNormalized;
    }

    formatLocation(conf) {
        // Use new city/country structure if available
        if (conf.city && conf.country) {
            return `${conf.city}, ${conf.country}`;
        }
        // Fallback to original location field
        return conf.location || 'Location TBD';
    }

    initializeMap() {
        // Initialize the map
        this.map = L.map('world-map').setView([40.0, 0.0], 2);

        // Add tile layer (map background)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Create a marker cluster group
        const markers = L.layerGroup().addTo(this.map);

        // Add markers for each conference
        this.conferencesData.forEach(conf => {
            const coords = this.getCoordinates(conf);
            if (coords) {
                const marker = this.createConferenceMarker(conf, coords);
                marker.addTo(markers);
            }
        });

        // Fit map to show all markers
        if (markers.getLayers().length > 0) {
            const group = new L.featureGroup(markers.getLayers());
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    createConferenceMarker(conf, coords) {
        // Get color based on presentation type
        const color = this.getMarkerColor(conf.type);
        
        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Create popup content
        const popupContent = `
            <div style="min-width: 250px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${conf.title}</h4>
                <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Conference:</strong> ${conf.conference}</p>
                <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Location:</strong> ${this.formatLocation(conf)}</p>
                <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Date:</strong> ${new Date(conf.date).toLocaleDateString()}</p>
                <p style="margin: 4px 0; color: #6b7280; font-size: 12px;"><strong>Type:</strong> ${conf.type}</p>
                ${conf.award ? `<p style="margin: 4px 0; color: #f59e0b; font-size: 12px;"><strong>🏆 Award:</strong> ${conf.award}</p>` : ''}
            </div>
        `;

        return L.marker(coords, { icon: icon }).bindPopup(popupContent);
    }

    getMarkerColor(type) {
        if (!type) return '#6b7280';
        
        const typeNormalized = type.toLowerCase();
        
        if (typeNormalized.includes('keynote')) return '#8b5cf6';
        if (typeNormalized.includes('invited')) return '#06b6d4';
        if (typeNormalized.includes('oral')) return '#10b981';
        if (typeNormalized.includes('poster')) return '#f59e0b';
        if (typeNormalized.includes('online')) return '#ef4444';
        
        return '#6b7280';
    }

    getCoordinates(conf) {
        // You'll need to add coordinates to your JSON or use a geocoding service
        // For now, here's a basic mapping for common locations
        const locationCoords = {
            // USA locations
            'anchorage': [61.2181, -149.9003],
            'san francisco': [37.7749, -122.4194],
            'washington dc': [38.9072, -77.0369],
            'honolulu': [21.3099, -157.8581],
            
            // International locations
            'amsterdam': [52.3676, 4.9041],
            'netherlands': [52.3676, 4.9041],
            
            // Add more as needed
        };

        // Try to match city from new structure
        if (conf.city) {
            const cityKey = conf.city.toLowerCase();
            if (locationCoords[cityKey]) {
                return locationCoords[cityKey];
            }
        }

        // Fallback to parsing location field
        if (conf.location) {
            const locationKey = conf.location.toLowerCase();
            for (const [key, coords] of Object.entries(locationCoords)) {
                if (locationKey.includes(key)) {
                    return coords;
                }
            }
        }

        return null; // Return null if location not found
    }

    // ...existing code...
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ConferencesPage();
});
