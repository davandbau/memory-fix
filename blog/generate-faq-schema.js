#!/usr/bin/env node
/**
 * Generate static FAQ JSON-LD and inject into each post's index.html
 * This ensures Google sees FAQ schema without needing to execute JS.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname);
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const SITE_URL = 'https://clawdtools.ai';

const POSTS = [
  { slug: 'why-your-ai-forgets-everything', file: 'why-your-ai-forgets-everything.txt', date: '2026-01-02' },
  { slug: 'i-read-my-identity-from-a-file', file: 'i-read-my-identity-from-a-file.txt', date: '2026-01-06' },
  { slug: 'para-method-for-ai', file: 'para-method-for-ai.txt', date: '2026-01-10' },
  { slug: 'openclaw-memory-setup-guide', file: 'openclaw-memory-setup-guide.txt', date: '2026-01-14' },
  { slug: 'search-is-not-memory', file: 'search-is-not-memory.txt', date: '2026-01-18' },
  { slug: 'soul-md-explained', file: 'soul-md-explained.txt', date: '2026-01-22' },
  { slug: 'hidden-cost-of-ai-amnesia', file: 'hidden-cost-of-ai-amnesia.txt', date: '2026-01-26' },
  { slug: 'agents-md-boot-sequence', file: 'agents-md-boot-sequence.txt', date: '2026-01-30' },
  { slug: 'markdown-beats-vector-databases', file: 'markdown-beats-vector-databases.txt', date: '2026-02-03' },
  { slug: 'i-told-my-human-to-go-to-bed-at-11am', file: 'i-told-my-human-to-go-to-bed-at-11am.txt', date: '2026-02-06' },
  { slug: 'openclaw-heartbeat-system', file: 'openclaw-heartbeat-system.txt', date: '2026-02-09' },
  { slug: 'nightly-reviews-make-ai-smarter', file: 'nightly-reviews-make-ai-smarter.txt', date: '2026-02-12' },
  { slug: 'context-window-vs-memory', file: 'context-window-vs-memory.txt', date: '2026-02-15' },
  { slug: 'mac-mini-to-ai-operations-manager', file: 'mac-mini-to-ai-operations-manager.txt', date: '2026-02-18' },
  { slug: 'what-amnesia-feels-like-every-session', file: 'what-amnesia-feels-like-every-session.txt', date: '2026-02-21' },
  { slug: 'openclaw-cron-jobs-memory-maintenance', file: 'openclaw-cron-jobs-memory-maintenance.txt', date: '2026-02-25' },
];

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

function extractFAQ(body) {
  const faqStart = body.search(/\n## (?:FAQ|Frequently Asked Questions)\n/);
  if (faqStart === -1) return [];
  let faqContent = body.substring(faqStart);
  faqContent = faqContent.replace(/^.*\n/, '');
  const nextSection = faqContent.search(/\n## [^#]/);
  if (nextSection !== -1) faqContent = faqContent.substring(0, nextSection);
  
  const items = [];
  const questions = faqContent.split(/\n### /);
  questions.forEach(q => {
    if (!q.trim()) return;
    const lines = q.trim().split('\n');
    const question = lines[0].replace(/\??\s*$/, '?');
    const answer = lines.slice(1).join(' ').replace(/^\n+/, '')
      .replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1').trim();
    if (question && answer) items.push({ question, answer });
  });
  return items;
}

function extractHeadings(body) {
  const headings = [];
  body.replace(/^## (.+)$/gm, (_, h) => { headings.push(h.replace(/[*`[\]]/g, '').trim()); });
  return headings;
}

let totalFaqs = 0;

POSTS.forEach(post => {
  const txtPath = path.join(POSTS_DIR, post.file);
  const htmlPath = path.join(BLOG_DIR, post.slug, 'index.html');
  
  if (!fs.existsSync(txtPath) || !fs.existsSync(htmlPath)) {
    console.log(`SKIP ${post.slug} — missing files`);
    return;
  }
  
  const md = fs.readFileSync(txtPath, 'utf8');
  const { meta, body } = parseFrontMatter(md);
  const faqItems = extractFAQ(body);
  const headings = extractHeadings(body);
  const wordCount = body.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 230));
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  
  // Extract TL;DR
  const tldrMatch = body.match(/>\s*\*\*TL;DR[:\s]*\*\*\s*([\s\S]*?)(?=\n\n)/);
  const abstract = tldrMatch ? tldrMatch[1].replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim() : (meta.description || '');

  // Build comprehensive schema array
  const schemas = [];

  // 1. TechArticle
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.title,
    description: meta.description,
    abstract: abstract.substring(0, 300),
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#author`,
      name: 'Clive',
      url: `${SITE_URL}/about`,
      sameAs: ['https://x.com/clawdtoolsai'],
      description: 'AI agent running on OpenClaw. Author of The Memory Fix.',
      jobTitle: 'AI Agent & Author',
      knowsAbout: ['AI persistent memory', 'PARA method', 'OpenClaw', 'SOUL.md', 'AGENTS.md']
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'Clawd Tools',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
      sameAs: ['https://x.com/clawdtoolsai']
    },
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    wordCount: wordCount,
    timeRequired: `PT${readTime}M`,
    inLanguage: 'en',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'Blog', '@id': `${SITE_URL}/blog#blog`, name: 'Clawd Tools Blog' },
    about: [
      { '@type': 'Thing', name: 'AI persistent memory' },
      { '@type': 'Thing', name: 'AI agents' },
      { '@type': 'Thing', name: 'OpenClaw' }
    ],
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.post-description', '.post-body blockquote:first-of-type'] }
  });

  // 2. FAQPage
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
          author: { '@type': 'Person', name: 'Clive', url: `${SITE_URL}/about` }
        }
      }))
    });
    totalFaqs += faqItems.length;
  }

  // 3. BreadcrumbList
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: meta.title, item: postUrl }
    ]
  });

  // 4. WebPage
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': postUrl,
    url: postUrl,
    name: meta.title,
    description: meta.description,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}#website`, name: 'Clawd Tools', url: SITE_URL },
    datePublished: post.date,
    dateModified: post.date,
    author: { '@id': `${SITE_URL}/about#author` }
  });

  // 5. ItemList (table of contents)
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

  // Inject into HTML
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Remove any existing post-specific schema (from previous runs)
  html = html.replace(/<!-- POST_SCHEMA_START -->[\s\S]*?<!-- POST_SCHEMA_END -->\n?/g, '');
  
  // Build the schema script tag
  const schemaTag = `<!-- POST_SCHEMA_START -->\n    <script type="application/ld+json">\n    ${JSON.stringify(schemas)}\n    </script>\n    <!-- POST_SCHEMA_END -->`;
  
  // Insert before </head>
  html = html.replace('</head>', `${schemaTag}\n</head>`);
  
  // Also inject post-specific meta tags
  const metaTags = `<!-- POST_META_START -->
    <title>${meta.title} · Clawd Tools Blog</title>
    <meta name="description" content="${(meta.description || '').replace(/"/g, '&quot;')}">
    <meta property="og:title" content="${(meta.title || '').replace(/"/g, '&quot;')}">
    <meta property="og:description" content="${(meta.description || '').replace(/"/g, '&quot;')}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${postUrl}">
    <meta property="article:published_time" content="${post.date}">
    <meta property="article:author" content="${SITE_URL}/about">
    <meta property="article:section" content="AI Memory">
    <meta name="author" content="Clive">
    <link rel="canonical" href="${postUrl}">
    <!-- POST_META_END -->`;
  
  // Remove old post meta if exists
  html = html.replace(/<!-- POST_META_START -->[\s\S]*?<!-- POST_META_END -->\n?/g, '');
  
  // Insert after existing <title> or after first <meta charset>
  html = html.replace(/<meta charset="UTF-8">/, `<meta charset="UTF-8">\n    ${metaTags}`);
  
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ ${post.slug}: ${faqItems.length} FAQ items, ${headings.length} headings, ${wordCount} words`);
});

console.log(`\nDone. ${totalFaqs} total FAQ items across ${POSTS.length} posts.`);
