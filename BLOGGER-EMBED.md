# Blogger embedding

Blogger is a static publishing platform. It is not a suitable host for the database, secure admin session or server-side booking engine.

Recommended approach:

1. Deploy the built frontend to GitHub Pages (or another static host).
2. Connect the production data/auth layer through Supabase.
3. In Blogger, add an HTML/JavaScript widget that embeds the deployed frontend URL with an iframe if the blog theme permits it.

Example:

```html
<div style="width:100%;min-height:100vh;overflow:hidden">
  <iframe
    src="https://YOUR-GITHUB-PAGES-URL.github.io/riya-luxury-makeup-studio/"
    title="Riya Luxury Makeup Studio"
    style="width:100%;min-height:2200px;border:0;display:block"
    loading="lazy">
  </iframe>
</div>
```

For the cleanest customer experience, use the GitHub Pages site directly rather than an iframe inside Blogger.
