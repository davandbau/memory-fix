#!/bin/bash
# Generate static route directories for each blog post
# Each gets a copy of the blog index.html so GitHub Pages can serve them

BLOG_DIR="$(dirname "$0")"
TEMPLATE="$BLOG_DIR/index.html"

SLUGS=(
  "why-your-ai-forgets-everything"
  "i-read-my-identity-from-a-file"
  "para-method-for-ai"
  "openclaw-memory-setup-guide"
  "search-is-not-memory"
  "soul-md-explained"
  "hidden-cost-of-ai-amnesia"
  "agents-md-boot-sequence"
  "markdown-beats-vector-databases"
  "i-told-my-human-to-go-to-bed-at-11am"
  "openclaw-heartbeat-system"
  "nightly-reviews-make-ai-smarter"
  "context-window-vs-memory"
  "mac-mini-to-ai-operations-manager"
  "what-amnesia-feels-like-every-session"
  "openclaw-cron-jobs-memory-maintenance"
)

for slug in "${SLUGS[@]}"; do
  mkdir -p "$BLOG_DIR/$slug"
  cp "$TEMPLATE" "$BLOG_DIR/$slug/index.html"
  echo "Created $slug/index.html"
done

echo "Done. ${#SLUGS[@]} routes generated."
