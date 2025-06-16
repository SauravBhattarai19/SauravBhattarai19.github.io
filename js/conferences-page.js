// Conferences page functionality
class ConferencesPage {
    constructor() {
        this.dataManager = new DataManager();
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.conferencesData = null;
        this.map = null;
        this.markers = [];
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Conferences Page...');
            
            // Wait for DOM to be fully loaded
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    window.addEventListener('load', resolve);
                });
            }

            this.conferencesData = await this.dataManager.getConferences();
            console.log('📊 Loaded conference data:', this.conferencesData?.length || 0, 'conferences');
            
            if (this.conferencesData && this.conferencesData.length > 0) {
                // Debug coordinates first
                this.debugCoordinates();
                
                this.renderUpcomingConferences();
                this.renderRecentPresentations();
                this.renderAllConferences();
                this.setupEventListeners();
                this.updateStats();
                  // Initialize map with delay to ensure DOM is ready
                setTimeout(() => {
                    this.initializeMap();
                    this.setupRecentPresentationsScroll();
                }, 500);
            } else {
                console.error('❌ No conference data loaded');
            }
        } catch (error) {
            console.error('❌ Error initializing conferences page:', error);
        }
    }

    renderUpcomingConferences() {
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
                    <h3 class="conf-title">${conf.title}</h3>
                    <p class="conf-event">${conf.conference}</p>
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
    }

    renderRecentPresentations() {
        const timeline = document.getElementById('recent-presentations-timeline');
        if (!timeline) return;

        const currentDate = new Date();
        const recent = (this.conferencesData || [])
            .filter(conf => conf.status === 'presented' || new Date(conf.date) <= currentDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        timeline.innerHTML = recent.map((conf, index) => `
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
                        </div>
                        <div class="detail-item">
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

        let filteredConferences = this.conferencesData || [];

        // Apply filters
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
                        </div>
                        <div class="conf-badges">
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
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderAllConferences();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderAllConferences();
            });
        }

        // Handle window resize for map
        window.addEventListener('resize', () => {
            if (this.map) {
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            }
        });

        // Handle tab visibility change (in case map is in a hidden tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.map) {
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            }
        });
    }

    updateStats() {
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
            if (conf.country) {
                countries.add(conf.country.trim());
            }
        });

        // Calculate awards received
        const awards = this.conferencesData.filter(conf => conf.award && conf.award.trim() !== '').length;

        // Update the display
        document.getElementById('total-presentations').textContent = totalPresentations;
        document.getElementById('countries-visited').textContent = countries.size;
        document.getElementById('awards-received').textContent = awards;
    }

    initializeMap() {
        console.log('🗺️ Starting map initialization...');
        
        const mapContainer = document.getElementById('world-map');
        if (!mapContainer) {
            console.error('❌ Map container element not found');
            return;
        }

        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet library not loaded');
            return;
        }

        try {
            // Clear any existing map instance
            if (this.map) {
                this.map.remove();
                this.map = null;
            }

            // Clear any existing markers
            this.markers = [];

            console.log('🌍 Creating map instance...');
            
            // Initialize the map with basic options
            this.map = L.map('world-map', {
                center: [40.0, 0.0],
                zoom: 2,
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
                dragging: true,
                touchZoom: true,
                maxZoom: 18,
                minZoom: 1
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors',
                crossOrigin: true
            }).addTo(this.map);

            console.log('✅ Map created successfully');

            // Process conferences and create markers
            this.createAllMarkers();

            // Force map to resize properly
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                    console.log('🔄 Map size invalidated');
                }
            }, 100);

        } catch (error) {
            console.error('❌ Error initializing map:', error);
        }
    }

    createAllMarkers() {
        console.log(`🎯 Creating markers for ${this.conferencesData.length} conferences...`);
        
        // Group conferences by location
        const locationGroups = new Map();
        
        this.conferencesData.forEach((conf, index) => {
            const coords = this.getCoordinates(conf);
            if (coords && coords.length === 2) {
                // Round coordinates to avoid tiny differences
                const lat = Math.round(coords[0] * 1000) / 1000;
                const lng = Math.round(coords[1] * 1000) / 1000;
                const key = `${lat},${lng}`;
                
                if (!locationGroups.has(key)) {
                    locationGroups.set(key, {
                        coordinates: [lat, lng],
                        conferences: [],
                        locationName: this.formatLocation(conf)
                    });
                }
                locationGroups.get(key).conferences.push(conf);
            }
        });

        console.log(`📍 Found ${locationGroups.size} unique locations`);

        // Create markers for each location
        locationGroups.forEach((group, key) => {
            try {
                const marker = this.createMarkerForLocation(group);
                if (marker) {
                    marker.addTo(this.map);
                    this.markers.push(marker);
                    console.log(`✅ Created marker for ${group.locationName} (${group.conferences.length} conferences)`);
                }
            } catch (error) {
                console.error(`❌ Error creating marker for ${group.locationName}:`, error);
            }
        });

        console.log(`🎯 Created ${this.markers.length} markers total`);

        // Fit map to show all markers
        if (this.markers.length > 0) {
            setTimeout(() => {
                try {
                    const group = new L.featureGroup(this.markers);
                    this.map.fitBounds(group.getBounds().pad(0.1));
                    console.log('🔍 Map fitted to show all markers');
                } catch (error) {
                    console.error('Error fitting bounds:', error);
                }
            }, 1000);
        }
    }

    createMarkerForLocation(locationGroup) {
        const { coordinates, conferences, locationName } = locationGroup;
        const conferenceCount = conferences.length;
        
        // Choose marker style based on number of conferences
        let markerHtml, iconSize;
        
        if (conferenceCount === 1) {
            // Single conference marker
            const conf = conferences[0];
            const color = this.getMarkerColor(conf.type);
            markerHtml = `
                <div style="
                    width: 24px; 
                    height: 24px; 
                    background: ${color}; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                ">
                    <i class="fas fa-microphone" style="color: white; font-size: 10px;"></i>
                </div>
            `;
            iconSize = [24, 24];
        } else {
            // Multiple conferences marker
            markerHtml = `
                <div style="
                    width: 36px; 
                    height: 36px; 
                    background: linear-gradient(135deg, #4f46e5, #7c3aed); 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 3px 12px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-weight: bold;
                    color: white;
                    font-size: 14px;
                ">
                    ${conferenceCount}
                </div>
            `;
            iconSize = [36, 36];
        }

        const icon = L.divIcon({
            className: 'custom-conference-marker',
            html: markerHtml,
            iconSize: iconSize,
            iconAnchor: [iconSize[0]/2, iconSize[1]/2]
        });

        const marker = L.marker(coordinates, { icon: icon });
        
        // Create popup content
        const popupContent = this.createPopupContent(locationGroup);
        
        marker.bindPopup(popupContent, {
            maxWidth: conferenceCount > 1 ? 500 : 400,
            minWidth: 300,
            maxHeight: 500,
            className: 'custom-conference-popup'
        });

        return marker;
    }

    createPopupContent(locationGroup) {
        const { conferences, locationName } = locationGroup;
        
        if (conferences.length === 1) {
            return this.createSingleConferencePopup(conferences[0]);
        } else {
            return this.createMultipleConferencesPopup(locationGroup);
        }
    }

    createSingleConferencePopup(conf) {
        const typeColor = this.getMarkerColor(conf.type);
        
        return `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 280px;">
                <div style="background: linear-gradient(135deg, ${typeColor}, ${typeColor}dd); color: white; padding: 16px; margin: -12px -12px 16px -12px; border-radius: 12px 12px 0 0;">
                    <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${conf.title}</h4>
                    <p style="margin: 0; font-size: 13px; opacity: 0.9;">${conf.type}</p>
                </div>
                
                <div style="padding: 0 4px;">
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #374151; font-size: 12px;">🏛️ Conference:</strong><br>
                        <span style="color: #1f2937; font-size: 13px;">${conf.conference}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div>
                            <strong style="color: #374151; font-size: 12px;">📅 Date:</strong><br>
                            <span style="color: #1f2937; font-size: 13px;">${new Date(conf.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <strong style="color: #374151; font-size: 12px;">📍 Location:</strong><br>
                            <span style="color: #1f2937; font-size: 13px;">${this.formatLocation(conf)}</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #374151; font-size: 12px;">👥 Authors:</strong><br>
                        <span style="color: #1f2937; font-size: 12px;">${conf.authors}</span>
                    </div>
                    
                    ${conf.award ? `
                        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-align: center;">
                            🏆 ${conf.award}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createMultipleConferencesPopup(locationGroup) {
        const { conferences, locationName } = locationGroup;
        const sortedConfs = conferences.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 420px; max-width: 480px;">
                <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 16px; margin: -12px -12px 16px -12px; border-radius: 12px 12px 0 0;">
                    <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">📍 ${locationName}</h4>
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">${conferences.length} presentations at this location</p>
                </div>
                
                <div style="max-height: 350px; overflow-y: auto; padding: 0 4px;" class="scrollable-conferences">
        `;
        
        sortedConfs.forEach((conf, index) => {
            const typeColor = this.getMarkerColor(conf.type);
            
            html += `
                <div style="
                    background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; 
                    padding: 16px; 
                    border-radius: 12px; 
                    margin-bottom: 12px; 
                    border-left: 4px solid ${typeColor}; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: transform 0.2s ease;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h5 style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 700; line-height: 1.3; flex: 1; padding-right: 8px;">
                            ${conf.title}
                        </h5>
                        <span style="
                            background: ${typeColor}; 
                            color: white; 
                            padding: 4px 8px; 
                            border-radius: 12px; 
                            font-size: 10px; 
                            font-weight: 600; 
                            white-space: nowrap;
                            text-transform: uppercase;
                        ">
                            ${conf.type}
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <strong style="color: #6b7280; font-size: 11px;">🏛️ Conference:</strong><br>
                        <span style="color: #1f2937; font-size: 12px;">${conf.conference}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div>
                            <strong style="color: #6b7280; font-size: 11px;">📅 Date:</strong><br>
                            <span style="color: #1f2937; font-size: 12px;">${new Date(conf.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <strong style="color: #6b7280; font-size: 11px;">📅 Year:</strong><br>
                            <span style="color: #1f2937; font-size: 12px;">${conf.year}</span>
                        </div>
                    </div>
                    
                    ${conf.award ? `
                        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-top: 8px; text-align: center;">
                            🏆 ${conf.award}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
                <div style="background: #f1f5f9; padding: 12px; margin: 16px -12px -12px -12px; border-radius: 0 0 12px 12px; text-align: center; font-size: 11px; color: #6b7280;">
                    💡 Scroll above to see all ${conferences.length} presentations
                </div>
            </div>
        `;
        
        return html;
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
        // First priority: Use coordinates directly from JSON if available
        if (conf.coordinates && Array.isArray(conf.coordinates) && conf.coordinates.length === 2) {
            const lat = parseFloat(conf.coordinates[0]);
            const lng = parseFloat(conf.coordinates[1]);
            
            // Validate that coordinates are valid numbers and within reasonable ranges
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                console.log(`✅ Using coordinates for "${conf.title}" in ${this.formatLocation(conf)}: [${lat}, ${lng}]`);
                return [lat, lng];
            } else {
                console.warn(`⚠️ Invalid coordinates for "${conf.title}": [${conf.coordinates[0]}, ${conf.coordinates[1]}] (lat: ${lat}, lng: ${lng})`);
                return null;
            }
        }

        // If no coordinates in JSON, return null
        console.warn(`❌ No coordinates found for conference: "${conf.title}" in ${conf.location || (conf.city + ', ' + conf.country)}`);
        return null;
    }

    // Add debugging method to verify all coordinates
    debugCoordinates() {
        console.log('🔍 Debugging conference coordinates:');
        const validCoords = [];
        const invalidCoords = [];
        
        this.conferencesData.forEach((conf, index) => {
            const coords = this.getCoordinates(conf);
            if (coords) {
                validCoords.push({
                    title: conf.title,
                    location: this.formatLocation(conf),
                    coords: coords,
                    year: conf.year
                });
            } else {
                invalidCoords.push({
                    title: conf.title,
                    location: this.formatLocation(conf),
                    rawCoords: conf.coordinates
                });
            }
        });
        
        console.log(`✅ Valid coordinates: ${validCoords.length}`);
        console.table(validCoords);
        
        if (invalidCoords.length > 0) {
            console.log(`❌ Invalid coordinates: ${invalidCoords.length}`);
            console.table(invalidCoords);
        }
        
        return { valid: validCoords, invalid: invalidCoords };
    }

    getDaysUntil(date) {
        const now = new Date();
        const target = new Date(date);
        const diffTime = target - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    getTypeIcon(type) {
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
    }

    getTypeCssClass(type) {
        if (!type) return 'presentation';
        
        const typeNormalized = type.toLowerCase().replace(/\s+/g, '-');
        
        if (typeNormalized.includes('keynote')) return 'keynote-presentation';
        if (typeNormalized.includes('invited')) return 'invited-presentation';
        if (typeNormalized.includes('online') && typeNormalized.includes('poster')) return 'online-poster-presentation';
        if (typeNormalized.includes('online')) return 'online-presentation';
        if (typeNormalized.includes('oral')) return 'oral-presentation';
        if (typeNormalized.includes('poster')) return 'poster-presentation';
        
        return typeNormalized;
    }    formatLocation(conf) {
        // Use new city/country structure if available
        if (conf.city && conf.country) {
            return `${conf.city}, ${conf.country}`;
        }
        // Fallback to original location field
        return conf.location || 'Location TBD';
    }

    // Add smooth scroll functionality for horizontal scrolling
    setupRecentPresentationsScroll() {
        const scrollContainer = document.querySelector('.recent-presentations-horizontal-scroll');
        if (!scrollContainer) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        scrollContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
            scrollContainer.style.cursor = 'grabbing';
        });

        scrollContainer.addEventListener('mouseleave', () => {
            isDown = false;
            scrollContainer.style.cursor = 'grab';
        });

        scrollContainer.addEventListener('mouseup', () => {
            isDown = false;
            scrollContainer.style.cursor = 'grab';
        });

        scrollContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            scrollContainer.scrollLeft = scrollLeft - walk;
        });

        // Touch events for mobile
        scrollContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
        });

        scrollContainer.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            scrollContainer.scrollLeft = scrollLeft - walk;
        });

        // Set initial cursor style
        scrollContainer.style.cursor = 'grab';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ConferencesPage();
});
