# Quick Setup Guide

## To Update Your Website Content:

### 1. Adding a New Publication
1. Open `data/publications.json`
2. Add your new publication to either "published" or "under_review" array
3. Include: year, title, authors, journal, DOI, etc.
4. Set `"featured": true` for important papers
5. Save the file - changes will appear immediately!

### 2. Adding a Conference Presentation
1. Open `data/conferences.json`
2. Add new entry with: title, conference, location, date, type
3. Set `"status": "upcoming"` or `"presented"`
4. Add file names for slides/posters in `assets/conferences/`

### 3. Adding Research Projects
1. Open `data/research.json`
2. Add project details, technologies, collaborators
3. Add project image to `assets/research/` folder
4. Link related publications by title

### 4. Adding Achievements
1. Open `data/achievements.json`
2. Add awards, fellowships, grants
3. Set category: "Fellowship", "Scholarship", "Competition", etc.
4. Set `"featured": true` for major achievements

### 5. Adding Files
- Publications PDFs → `assets/publications/`
- Research images → `assets/research/`  
- Conference slides/posters → `assets/conferences/`

## Publishing Changes
1. Commit changes to GitHub
2. Website updates automatically via GitHub Pages
3. Changes are live within minutes!

## Need Help?
- Check JSON syntax with online validators
- Keep file names consistent (no spaces, use underscores)
- Test locally by opening index.html in browser
- Refer to README_NEW.md for detailed instructions
