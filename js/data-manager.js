// Data Manager - Handles loading and caching of JSON data
class DataManager {    constructor() {
        this.cache = {};
        this.loading = {};
    }

    // Clear cache to force fresh data load
    clearCache() {
        this.cache = {};
        this.loading = {};
    }

    async loadData(filename) {
        if (this.cache[filename]) {
            return this.cache[filename];
        }

        if (this.loading[filename]) {
            return this.loading[filename];
        }        // Add cache-busting parameter to force fresh data load
        const cacheBuster = new Date().getTime();
        this.loading[filename] = fetch(`./data/${filename}?v=${cacheBuster}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${filename}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                this.cache[filename] = data;
                delete this.loading[filename];
                return data;
            })
            .catch(error => {
                console.error('Error loading data:', error);
                delete this.loading[filename];
                return null;
            });

        return this.loading[filename];
    }

    async getPublications() {
        return await this.loadData('publications.json');
    }

    async getConferences() {
        return await this.loadData('conferences.json');
    }

    async getResearch() {
        return await this.loadData('research.json');
    }

    async getAchievements() {
        return await this.loadData('achievements.json');
    }

    async getProfile() {
        return await this.loadData('profile.json');
    }

    // Method to refresh data (useful when content is updated)
    refreshData(filename) {
        delete this.cache[filename];
        return this.loadData(filename);
    }

    // Method to refresh all data
    refreshAllData() {
        this.cache = {};
        this.loading = {};
    }
}

// Create global instance
window.dataManager = new DataManager();
