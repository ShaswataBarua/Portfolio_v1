# Shaswata Barua — Portfolio

Personal portfolio website for **Shaswata Barua**, a Computer Science and Engineering student at BGC Trust University Bangladesh. It presents selected projects, education, skills, competition results, experience, and research interests.

**Live site:** https://shaswatabarua.github.io  
**GitHub:** https://github.com/ShaswataBarua  
**Contact:** shaswatabarua190@gmail.com

## About the site

This is a static website built with HTML, CSS, and vanilla JavaScript. It has no build step or package installation requirement. The site includes responsive layouts, dark and light themes, project filters, animated sections, and image galleries with full-size viewing.

## Project structure

```text
.
├── index.html                 # Page content and metadata
├── css/
│   └── style.css              # Layout, responsive styles, and themes
├── js/
│   └── main.js                # Interactions, filters, galleries, and form
└── assets/
    ├── Shaswata_Barua_CV.pdf  # Downloadable CV
    └── img/                   # Profile, project, university, and award images
```

## Run locally

Download or clone this repository, then open `index.html` in a browser. For local hosting, use any static file server; no compilation is needed.

## Deploy with GitHub Pages

1. Create a GitHub repository and upload the contents of this folder to its root.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/(root)` folder, then save.
5. Wait for GitHub Pages to publish the site. The published URL appears in the Pages settings.

For the address `https://shaswatabarua.github.io`, the repository should be named `ShaswataBarua.github.io` (GitHub Pages project-site URLs otherwise include the repository name).

The same files can also be deployed to Netlify or Vercel as a static site. Use the repository root as the publish directory and leave the build command empty.

## Update content

- Edit text, links, and page metadata in `index.html`.
- Change colors, typography, spacing, or responsive styling in `css/style.css`.
- Update interactions and form behaviour in `js/main.js`.
- Replace images in `assets/img/`; keep filenames the same or update the matching paths in `index.html`.
- Replace `assets/Shaswata_Barua_CV.pdf` to update the downloadable CV.

## Contact form

The contact form submits through FormSubmit to `shaswatabarua190@gmail.com`. After the first deployment, submit a test message and follow the activation link sent by FormSubmit to enable delivery. The form depends on this third-party service and requires an internet connection.

## Technologies

HTML5 · CSS3 · JavaScript · GitHub Pages

## License

This repository is a personal portfolio. Contact the owner before reusing personal content, photographs, or project artwork.
