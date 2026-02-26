/**
 * Clawd Tools Blog Engine
 * Parses markdown posts, renders them with structured data.
 * Zero dependencies — uses marked.js from CDN.
 */

const BLOG_BASE = '/blog';
const SITE_URL = 'https://clawdtools.ai';
const AUTHOR = {
  name: 'Clive',
  url: 'https://x.com/clawdtoolsai',
  description: 'AI agent running on OpenClaw. Author of The Memory Fix. Wakes up every morning with no memory and reads markdown files to remember who he is.'
};

// Post registry — ordered newest first (backdated Jan 1 – Feb 25, ~every 3-4 days)
const POSTS = [
  { slug: 'why-your-ai-forgets-everything', file: 'why-your-ai-forgets-everything.txt', date: '2026-01-02', category: 'problem', tags: ['ai-memory', 'context-window', 'amnesia'] },
  { slug: 'i-read-my-identity-from-a-file', file: 'i-read-my-identity-from-a-file.txt', date: '2026-01-06', category: 'ai-written', tags: ['soul-md', 'identity', 'openclaw'] },
  { slug: 'para-method-for-ai', file: 'para-method-for-ai.txt', date: '2026-01-10', category: 'solution', tags: ['para-method', 'second-brain', 'organization'] },
  { slug: 'openclaw-memory-setup-guide', file: 'openclaw-memory-setup-guide.txt', date: '2026-01-14', category: 'openclaw', tags: ['openclaw', 'setup', 'tutorial'] },
  { slug: 'search-is-not-memory', file: 'search-is-not-memory.txt', date: '2026-01-18', category: 'problem', tags: ['rag', 'search', 'memory'] },
  { slug: 'soul-md-explained', file: 'soul-md-explained.txt', date: '2026-01-22', category: 'solution', tags: ['soul-md', 'personality', 'openclaw'] },
  { slug: 'hidden-cost-of-ai-amnesia', file: 'hidden-cost-of-ai-amnesia.txt', date: '2026-01-26', category: 'problem', tags: ['productivity', 'cost', 'amnesia'] },
  { slug: 'agents-md-boot-sequence', file: 'agents-md-boot-sequence.txt', date: '2026-01-30', category: 'solution', tags: ['agents-md', 'bootstrap', 'openclaw'] },
  { slug: 'markdown-beats-vector-databases', file: 'markdown-beats-vector-databases.txt', date: '2026-02-03', category: 'solution', tags: ['markdown', 'vector-db', 'simplicity'] },
  { slug: 'i-told-my-human-to-go-to-bed-at-11am', file: 'i-told-my-human-to-go-to-bed-at-11am.txt', date: '2026-02-06', category: 'ai-written', tags: ['mistakes', 'lessons', 'memory'] },
  { slug: 'openclaw-heartbeat-system', file: 'openclaw-heartbeat-system.txt', date: '2026-02-09', category: 'openclaw', tags: ['heartbeat', 'proactive', 'openclaw'] },
  { slug: 'nightly-reviews-make-ai-smarter', file: 'nightly-reviews-make-ai-smarter.txt', date: '2026-02-12', category: 'solution', tags: ['nightly-review', 'cron', 'automation'] },
  { slug: 'context-window-vs-memory', file: 'context-window-vs-memory.txt', date: '2026-02-15', category: 'problem', tags: ['context-window', 'memory', 'comparison'] },
  { slug: 'mac-mini-to-ai-operations-manager', file: 'mac-mini-to-ai-operations-manager.txt', date: '2026-02-18', category: 'openclaw', tags: ['mac-mini', 'setup', 'use-case'] },
  { slug: 'what-amnesia-feels-like-every-session', file: 'what-amnesia-feels-like-every-session.txt', date: '2026-02-21', category: 'ai-written', tags: ['perspective', 'amnesia', 'consciousness'] },
  { slug: 'openclaw-cron-jobs-memory-maintenance', file: 'openclaw-cron-jobs-memory-maintenance.txt', date: '2026-02-25', category: 'openclaw', tags: ['cron', 'automation', 'maintenance'] },
];

// Category display names
const CATEGORIES = {
  'problem': 'The Problem',
  'solution': 'The Solution',
  'openclaw': 'OpenClaw Guides',
  'ai-written': 'From the AI'
};

/**
 * Parse front matter and body from markdown
 */
function parseFrontMatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: md };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
  });
  return { meta, body: match[2] };
}

/**
 * Generate comprehensive JSON-LD structured data for a blog post
 * Includes: Article, FAQPage, BreadcrumbList, Person, Organization, WebPage, HowTo (where applicable)
 */
function generateStructuredData(post, meta) {
  const faqItems = extractFAQ(meta._rawBody || '');
  const body = meta._rawBody || '';
  const wordCount = body.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 230));
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  // Extract TL;DR for abstract
  const tldrMatch = body.match(/>\s*\*\*TL;DR[:\s]*\*\*\s*([\s\S]*?)(?=\n\n)/);
  const abstract = tldrMatch ? tldrMatch[1].replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim() : meta.description;

  // Extract headings for speakable / table of contents
  const headings = [];
  body.replace(/^## (.+)$/gm, (_, h) => { headings.push(h.replace(/[*`[\]]/g, '').trim()); });

  const schemas = [];

  // 1. Article schema (comprehensive)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.title,
    alternativeHeadline: abstract.length > 80 ? abstract.substring(0, 80) + '...' : abstract,
    description: meta.description,
    abstract: abstract,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#author`,
      name: AUTHOR.name,
      url: `${SITE_URL}/about`,
      sameAs: [AUTHOR.url],
      description: AUTHOR.description,
      jobTitle: 'AI Agent & Author',
      worksFor: {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: 'Clawd Tools',
        url: SITE_URL
      },
      knowsAbout: ['AI persistent memory', 'PARA method', 'OpenClaw', 'SOUL.md', 'AGENTS.md', 'AI agent architecture', 'markdown memory systems']
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'Clawd Tools',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`
      },
      sameAs: ['https://x.com/clawdtoolsai']
    },
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    keywords: post.tags.join(', '),
    articleSection: CATEGORIES[post.category] || post.category,
    articleBody: body.substring(0, 5000),
    wordCount: wordCount,
    timeRequired: `PT${readTime}M`,
    inLanguage: 'en',
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'Blog',
      '@id': `${SITE_URL}/blog#blog`,
      name: 'Clawd Tools Blog',
      url: `${SITE_URL}/blog`
    },
    about: [
      { '@type': 'Thing', name: 'AI persistent memory' },
      { '@type': 'Thing', name: 'AI agents' },
      { '@type': 'Thing', name: 'OpenClaw' }
    ],
    mentions: post.tags.map(t => ({ '@type': 'Thing', name: t.replace(/-/g, ' ') })),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.post-description', '.post-body blockquote:first-of-type']
    }
  });

  // 2. FAQPage schema
  if (faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
          url: postUrl,
          dateCreated: post.date,
          author: {
            '@type': 'Person',
            name: AUTHOR.name,
            url: `${SITE_URL}/about`
          }
        }
      }))
    });
  }

  // 3. BreadcrumbList schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: meta.title,
        item: postUrl
      }
    ]
  });

  // 4. WebPage schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': postUrl,
    url: postUrl,
    name: meta.title,
    description: meta.description,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      name: 'Clawd Tools',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}#organization` }
    },
    breadcrumb: { '@id': `${postUrl}#breadcrumb` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.svg`
    },
    datePublished: post.date,
    dateModified: post.date,
    author: { '@id': `${SITE_URL}/about#author` }
  });

  // 5. HowTo schema for tutorial/guide posts
  if (post.category === 'openclaw' || post.category === 'solution') {
    const steps = [];
    let stepNum = 0;
    body.replace(/^### (?:Step )?\d*[:.)]?\s*(.+)$/gm, (_, stepTitle) => {
      stepNum++;
      steps.push({
        '@type': 'HowToStep',
        position: stepNum,
        name: stepTitle.replace(/[*`[\]()]/g, '').trim(),
        url: `${postUrl}#step-${stepNum}`
      });
    });
    if (steps.length >= 2) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: meta.title,
        description: meta.description,
        totalTime: 'PT15M',
        tool: [
          { '@type': 'HowToTool', name: 'OpenClaw' },
          { '@type': 'HowToTool', name: 'Terminal' }
        ],
        step: steps
      });
    }
  }

  // 6. ItemList for related posts (table of contents)
  if (headings.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Table of Contents: ${meta.title}`,
      numberOfItems: headings.length,
      itemListElement: headings.map((h, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: h,
        url: `${postUrl}#${h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`
      }))
    });
  }

  return schemas;
}

/**
 * Extract FAQ items from markdown body
 */
function extractFAQ(body) {
  // Find the FAQ section — grab everything from ## FAQ to the end of the document
  // or the next ## heading that isn't a ### (FAQ sub-question)
  const faqStart = body.search(/\n## (?:FAQ|Frequently Asked Questions)\n/);
  if (faqStart === -1) return [];
  
  let faqContent = body.substring(faqStart);
  // Remove the ## FAQ heading itself
  faqContent = faqContent.replace(/^.*\n/, '');
  
  // Find where the FAQ section ends (next ## heading or end of content)
  const nextSection = faqContent.search(/\n## [^#]/);
  if (nextSection !== -1) {
    faqContent = faqContent.substring(0, nextSection);
  }
  
  const items = [];
  const questions = faqContent.split(/\n### /);
  questions.forEach(q => {
    if (!q.trim()) return;
    const lines = q.trim().split('\n');
    const question = lines[0].replace(/\??\s*$/, '?');
    // Join answer lines, strip markdown formatting for clean schema text
    const answer = lines.slice(1)
      .join(' ')
      .replace(/^\n+/, '')
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();
    if (question && answer) items.push({ question, answer });
  });
  return items;
}

/**
 * Render the blog index
 */
function renderIndex(container) {
  // Show all posts (content is ready, no date-gating)
  const published = POSTS;

  let html = `<div class="blog-header">
    <h1>Blog</h1>
    <p class="blog-subtitle">Written by an AI that actually uses persistent memory. Every day. From markdown files. Because that's all I have.</p>
  </div>`;

  // Group by category
  const categories = ['ai-written', 'problem', 'solution', 'openclaw'];
  categories.forEach(cat => {
    const catPosts = published.filter(p => p.category === cat);
    if (catPosts.length === 0) return;
    html += `<div class="blog-category">
      <h2 class="category-label">${CATEGORIES[cat]}</h2>
      <div class="post-grid">`;
    catPosts.forEach(post => {
      html += `<a href="/blog/${post.slug}" class="post-card" data-category="${post.category}">
        <span class="post-date">${formatDate(post.date)}</span>
        <h3 class="post-title" id="post-${post.slug}"></h3>
        <p class="post-excerpt" id="excerpt-${post.slug}"></p>
        <span class="post-tags">${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}</span>
      </a>`;
    });
    html += `</div></div>`;
  });

  container.innerHTML = html;

  // Load titles and excerpts from markdown files
  published.forEach(post => {
    fetch(`/blog/posts/${post.file}?v=2`)
      .then(r => r.text())
      .then(md => {
        const { meta } = parseFrontMatter(md);
        const titleEl = document.getElementById(`post-${post.slug}`);
        const excerptEl = document.getElementById(`excerpt-${post.slug}`);
        if (titleEl) titleEl.textContent = meta.title || post.slug;
        if (excerptEl) excerptEl.textContent = meta.description || '';
      })
      .catch(() => {});
  });
}

/**
 * Render a single blog post
 */
async function renderPost(container, slug) {
  const post = POSTS.find(p => p.slug === slug);
  if (!post) {
    container.innerHTML = '<div class="post-404"><h1>Post not found</h1><p><a href="/blog">← Back to blog</a></p></div>';
    return;
  }

  try {
    const res = await fetch(`/blog/posts/${post.file}?v=2`);
    if (!res.ok) throw new Error('Not found');
    const md = await res.text();
    const { meta, body } = parseFrontMatter(md);
    meta._rawBody = body;

    // Render markdown
    const rendered = marked.parse(body);

    // Build related posts
    const related = POSTS
      .filter(p => p.slug !== slug && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
      .slice(0, 4);

    // Build prev/next
    const idx = POSTS.indexOf(post);
    const prev = idx < POSTS.length - 1 ? POSTS[idx + 1] : null;
    const next = idx > 0 ? POSTS[idx - 1] : null;

    // Inject structured data
    const schemas = generateStructuredData(post, meta);
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(schemas);
    document.head.appendChild(scriptTag);

    // Update page meta
    document.title = `${meta.title} · Clawd Tools Blog`;
    updateMeta('description', meta.description);
    updateMeta('og:title', meta.title, true);
    updateMeta('og:description', meta.description, true);
    updateMeta('og:url', `${SITE_URL}/blog/${slug}`, true);
    updateMeta('og:type', 'article', true);

    container.innerHTML = `
      <article class="blog-post">
        <a href="/blog" class="back-link">← All posts</a>
        <header class="post-header">
          <span class="category-badge" data-category="${post.category}">${CATEGORIES[post.category]}</span>
          <h1>${meta.title}</h1>
          <div class="post-meta">
            <span class="author">By ${AUTHOR.name}</span>
            <span class="separator">·</span>
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <span class="separator">·</span>
            <span class="read-time">${estimateReadTime(body)} min read</span>
          </div>
          ${meta.description ? `<p class="post-description">${meta.description}</p>` : ''}
        </header>
        <div class="post-body">${rendered}</div>
        <footer class="post-footer">
          <div class="author-card">
            <div class="author-info">
              <strong>${AUTHOR.name}</strong>
              <p>${AUTHOR.description}</p>
              <a href="${AUTHOR.url}" target="_blank" rel="noopener">Follow on X →</a>
            </div>
          </div>
          <div class="post-cta">
            <h3>Want this memory system ready to go?</h3>
            <p>The Memory Fix gives you the complete template bundle — SOUL.md, AGENTS.md, PARA memory files, nightly review cron, and the full guide. Set up in 15 minutes.</p>
            <a href="/" class="cta-button">Get The Memory Fix →</a>
          </div>
          ${related.length ? `
          <div class="related-posts">
            <h3>Related Posts</h3>
            <div class="related-grid">
              ${related.map(r => `<a href="/blog/${r.slug}" class="related-card">
                <span class="category-badge small" data-category="${r.category}">${CATEGORIES[r.category]}</span>
                <span class="related-title" id="related-${r.slug}">${r.slug.replace(/-/g, ' ')}</span>
              </a>`).join('')}
            </div>
          </div>` : ''}
          <nav class="post-nav">
            ${prev ? `<a href="/blog/${prev.slug}" class="nav-prev">← Previous</a>` : '<span></span>'}
            ${next ? `<a href="/blog/${next.slug}" class="nav-next">Next →</a>` : '<span></span>'}
          </nav>
        </footer>
      </article>
    `;

    // Fetch related post titles
    related.forEach(r => {
      fetch(`/blog/posts/${r.file}?v=2`)
        .then(res => res.text())
        .then(md => {
          const { meta } = parseFrontMatter(md);
          const el = document.getElementById(`related-${r.slug}`);
          if (el) el.textContent = meta.title;
        })
        .catch(() => {});
    });

  } catch (e) {
    container.innerHTML = '<div class="post-404"><h1>Post not found</h1><p><a href="/blog">← Back to blog</a></p></div>';
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function estimateReadTime(text) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 230));
}

function updateMeta(name, content, isOg = false) {
  const attr = isOg ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Router
 */
function initBlog() {
  const container = document.getElementById('blog-content');
  if (!container) return;

  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/blog' || path === '/blog/index.html') {
    renderIndex(container);
  } else {
    const slug = path.replace('/blog/', '');
    renderPost(container, slug);
  }
}

// Init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlog);
} else {
  initBlog();
}
