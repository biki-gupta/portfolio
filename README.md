# Certificates folder

Put your certificate files (PDF or image) in this folder. The filenames must
match what's linked in `index.html`:

- indian-laws.pdf
- dsa-python.pdf
- intro-to-ai.pdf

If your file is an image (e.g. .jpg/.png) instead of a PDF, just:
1. Save it here with a matching name but the correct extension, e.g. `dsa-python.jpg`
2. Update the matching `href` in `index.html`'s Certifications section to that filename.

## Adding a new certificate card

Copy this block inside `<div class="cert-grid">` in `index.html`, then edit
the org, title, date, and filename:

```html
<article class="cert-card">
  <div class="cert-icon">◈</div>
  <div class="cert-org">ISSUING ORG</div>
  <h3>Certificate Title</h3>
  <span class="cert-date">Month Year</span>
  <a class="cert-link" href="certificates/your-file.pdf" target="_blank" rel="noopener">View Certificate ↗</a>
</article>
```

Add `class="cert-card featured"` instead of `class="cert-card"` if you want
that card to have the violet highlighted border.
