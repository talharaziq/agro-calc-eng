# Agriculture Calculator — Static Website

This folder is the full static website for Agriculture Calculator, aimed at a US farming audience. It contains **137 distinct calculator pages** across 11 categories, five long-form farm guides, the blog index, a searchable full calculator directory, homepage FAQs, and standard information pages.

## Deploy

1. Extract the ZIP. Upload the **contents of this folder** (so `index.html` and `assets/` are at the repository root) to a GitHub repository.
2. For GitHub Pages, enable Pages for the branch/folder containing `index.html`. For Cloudflare Pages, connect the repository and choose a static site. Set **no build command** and use the repository root as the output directory.
3. Open the published site and test mobile navigation, directory search, category filters, calculator calculations, and the contact form.
4. Replace site domain references if you later add canonical tags, share previews, analytics, advertising, or a sitemap. As requested, this package intentionally does **not** include `sitemap.xml` or `robots.txt`.

## Technical notes

- Plain HTML, CSS, and browser-side JavaScript; no framework, package manager, backend, or build process.
- The full calculator directory is emitted as static HTML. Search and category filtering enhance the page in the browser and do not require an API.
- All calculator computations run locally in the browser. The calculator form values are not sent to our server.
- Pages use US customary units where applicable (acres, pounds, US gallons, inches, bushels, MPH, US short tons, and dollars). Conversion pages state their conversion factor.
- Each calculator has its own title, description, formula, instructions, related-tool links, and 13 FAQs with FAQ structured data. Structured data does not guarantee a rich result or higher rank.
- DM Sans is loaded from Google Fonts. To eliminate the external font request, remove the Google Fonts `preconnect`/`stylesheet` lines from HTML or replace the font-family with a system stack.

## Contact form setup — important

`contact.html` submits to FormSubmit using the configured destination `talharaziq@outlook.com`. FormSubmit may email an activation request after the first live submission. Confirm that activation email, submit a real test message from the deployed domain, and confirm arrival in the Outlook inbox (including Junk). Delivery has not been verified from this environment. If you want a thank-you redirect after submission, set FormSubmit's `_next` field to your final absolute deployed URL after the domain is known.

## Research approach and SEO

The page architecture was informed by category-level review of five broad directories: AgroRates, FarmCalcs, AgriConverter, FarmMaths, and ToolFoundry. Selected formulas and category notes reference University of Minnesota Extension, Iowa State University Extension, Colorado State University Extension, Utah State University Extension, USDA NRCS, and NIST. The research page describes what each source informed and links directly to sources. This is **not** an exhaustive URL-by-URL audit of every competitor calculator, and no private keyword-volume data is represented as fact.

Each page aims to satisfy the calculator intent directly: title/meta, unique summary, exact input units, formula, instructions, limits, related pages, and calculator-specific FAQs. Keyword density is not a ranking guarantee; keep the language useful and natural. After launch, use Search Console queries and actual user feedback to identify pages that merit more crop-specific examples, citations, or additional unique content.

## Useful files

- `LAUNCH-CHECKLIST.md` — final deployment checks.
- `references.html` — competitor and reference review.
- `editorial-policy.html` — formula and correction policy.
- `contact.html` — contact form.
- `privacy-policy.html`, `terms-of-use.html`, `disclaimer.html`, `about.html` — informational and trust pages.

No rankings or AdSense approval are guaranteed. Helpful original content, accurate functionality, clear ownership and privacy disclosures, and policy compliance should be reviewed before applying to an ad network.
