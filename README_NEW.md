# Saurav Bhattarai - Professional Website

A dynamic, content-driven professional website for showcasing research, publications, conferences, and achievements in water resource engineering and hydro-climatology.

## 🌟 Features

### Dynamic Content Management
- **JSON-based content**: All publications, research, conferences, and achievements are loaded from JSON files
- **Easy updates**: Simply edit JSON files to add new content - no HTML knowledge required
- **Automatic refresh**: Content updates immediately when JSON files are modified
- **Modular architecture**: Separate modules for each content type

### Professional Sections
- **Research Projects**: Interactive grid/list view with filtering and detailed project information
- **Publications**: Filterable publication list with published and under-review papers
- **Conference Presentations**: Timeline view of conference presentations with filtering options
- **Achievements**: Awards, fellowships, and achievements with timeline/grid views
- **About**: Personal information and technical skills

### Advanced Features
- **Responsive design**: Works on all devices and screen sizes
- **Search and filters**: Filter content by type, status, year, etc.
- **Multiple view modes**: Grid, list, and timeline views
- **Smooth animations**: AOS (Animate On Scroll) integration
- **Professional styling**: Modern, clean design with consistent branding

## 📁 Project Structure

```
├── index.html              # Main website file
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript file
├── data/                   # Data files (JSON)
│   ├── publications.json   # Publications data
│   ├── conferences.json    # Conference presentations
│   ├── research.json       # Research projects
│   ├── achievements.json   # Awards and achievements
│   └── profile.json        # Personal information
├── js/                     # JavaScript modules
│   ├── data-manager.js     # Data loading and caching
│   ├── publications.js     # Publications module
│   ├── research.js         # Research projects module
│   ├── conferences.js      # Conferences module
│   └── achievements.js     # Achievements module
├── css/                    # Stylesheets
│   ├── publications.css    # Publications styling
│   ├── research.css        # Research styling
│   └── conferences.css     # Conferences & achievements styling
└── assets/                 # Static assets
    ├── publications/       # PDF files, supplementary materials
    ├── research/           # Research project images, documents
    └── conferences/        # Presentation slides, posters
```

## 🚀 Quick Start

### Adding New Content

#### 1. Publications
Edit `data/publications.json`:

```json
{
  "published": [
    {
      "year": "2025",
      "title": "Your Paper Title",
      "authors": "Your Name, Co-authors",
      "journal": "Journal Name",
      "volume": "15",
      "pages": "123-456",
      "doi": "https://doi.org/...",
      "type": "journal",
      "featured": true,
      "pdf": "filename.pdf"
    }
  ],
  "under_review": [
    {
      "year": "2025",
      "title": "Paper Under Review",
      "authors": "Your Name, Co-authors",
      "journal": "Target Journal",
      "status": "under review"
    }
  ]
}
```

#### 2. Conference Presentations
Edit `data/conferences.json`:

```json
[
  {
    "year": "2025",
    "title": "Presentation Title",
    "authors": "Your Name, Co-authors",
    "conference": "Conference Name",
    "location": "City, Country",
    "date": "Month DD-DD, YYYY",
    "type": "Oral Presentation",
    "status": "upcoming",
    "slides": "presentation.pdf",
    "poster": "poster.pdf"
  }
]
```

#### 3. Research Projects
Edit `data/research.json`:

```json
[
  {
    "title": "Project Title",
    "description": "Detailed project description",
    "technologies": ["Python", "Machine Learning", "GIS"],
    "status": "ongoing",
    "featured": true,
    "image": "project_image.jpg",
    "publications": ["Related publication titles"],
    "funding": "Funding source",
    "collaborators": ["Institution names"],
    "github": "https://github.com/...",
    "demo": "https://demo-link.com"
  }
]
```

#### 4. Achievements
Edit `data/achievements.json`:

```json
[
  {
    "year": "2025",
    "title": "Award Title",
    "organization": "Organization Name",
    "location": "Location",
    "description": "Award description",
    "category": "Fellowship",
    "featured": true,
    "award_amount": "$5000"
  }
]
```

### Adding Files

1. **Publications**: Place PDF files in `assets/publications/`
2. **Research**: Place project images in `assets/research/`
3. **Conferences**: Place slides/posters in `assets/conferences/`

### Deployment

1. **GitHub Pages**: Push to GitHub and enable Pages in repository settings
2. **Netlify**: Connect your GitHub repository for automatic deployments
3. **Custom Server**: Upload all files to your web server

## 🎨 Customization

### Styling
- Edit `styles.css` for global styles
- Edit individual CSS files in `css/` folder for section-specific styling
- Modify color scheme in CSS custom properties

### Functionality
- Edit JavaScript modules in `js/` folder
- Add new data fields in JSON files
- Customize filtering and sorting options

### Content
- Update `data/profile.json` for personal information
- Modify section titles and descriptions in JavaScript files
- Add new sections by creating new modules

## 🔧 Technical Features

### Data Management
- **Caching**: Automatic caching of JSON data for performance
- **Error handling**: Graceful error handling for missing data
- **Loading states**: Loading indicators while fetching data
- **Refresh capability**: Ability to refresh data without page reload

### User Interface
- **Responsive design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized loading and rendering
- **Cross-browser compatibility**: Works in all modern browsers

### Content Features
- **Search and filter**: Multiple filtering options for each section
- **Sorting**: Customizable sorting (by year, title, type, etc.)
- **View modes**: Grid, list, and timeline views
- **Interactive elements**: Expandable content, modals, tooltips

## 📱 Mobile Optimization

The website is fully responsive and optimized for:
- Mobile phones (320px and up)
- Tablets (768px and up)
- Desktop computers (1024px and up)
- Large screens (1440px and up)

## 🔒 Best Practices

### Content Management
1. Always validate JSON syntax before committing
2. Use consistent naming conventions for files
3. Optimize images before uploading (recommended: WebP format)
4. Keep file sizes reasonable for fast loading

### Maintenance
1. Regularly update content in JSON files
2. Test the website after adding new content
3. Keep backup copies of important files
4. Monitor website performance and loading times

## 🤝 Contributing

When adding new features:
1. Create new modules in the `js/` folder
2. Add corresponding CSS files in the `css/` folder
3. Update the main HTML file to include new sections
4. Test thoroughly across different devices and browsers

## 📞 Contact

**Saurav Bhattarai**
- Email: Saurav.bhattarai@students.jsums.edu
- LinkedIn: [saurav-bhattarai-7133a3176](https://linkedin.com/in/saurav-bhattarai-7133a3176)
- GitHub: [Saurav-JSU](https://github.com/Saurav-JSU)
- Research Group: [bit.ly/jsu_water](https://bit.ly/jsu_water)

---

*Last updated: June 2025*
