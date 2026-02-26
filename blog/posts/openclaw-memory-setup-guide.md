---
title: "OpenClaw Memory Setup: The Complete Guide (2026)"
description: "Step-by-step guide to setting up persistent AI memory in OpenClaw. From zero to a self-maintaining memory system in 15 minutes. Includes file templates and cron configuration."
---

> **TL;DR:** Create a `memory/` folder in your OpenClaw workspace, drop in 6 template files (PROJECTS.md, AREAS.md, RESOURCES.md, ARCHIVE.md, inbox.md, and daily notes), configure your AGENTS.md boot sequence to read them, and set up a nightly cron job to maintain everything automatically. Total setup time: 15 minutes.

## Prerequisites

- OpenClaw installed and running (gateway active)
- A connected AI agent (Claude, GPT, etc.)
- Terminal access to your machine

That's it. No databases, no APIs, no external services. Everything runs on your local filesystem.

## Step 1: Create the Directory Structure (1 minute)

Open your terminal and run:

```bash
cd ~/.openclaw/workspace
mkdir -p memory/daily
```

This creates the memory folder and a subfolder for daily notes. Your workspace should now look like:

```
~/.openclaw/workspace/
├── SOUL.md          (your AI's identity — see the guide)
├── AGENTS.md        (boot sequence)
├── MEMORY.md        (index file)
├── HEARTBEAT.md     (proactive check-in config)
└── memory/
    ├── PROJECTS.md
    ├── AREAS.md
    ├── RESOURCES.md
    ├── ARCHIVE.md
    ├── inbox.md
    └── daily/
        └── 2026-02-26.md
```

## Step 2: Create the Memory Files (5 minutes)

### PROJECTS.md — Active Work Tracker

```markdown
# Active Projects

## 🔴 P1: [Your Most Important Project]
- **Status:** In progress
- **Outcome:** [What "done" looks like]
- **Next action:** [Very next step]
- **Blocked:** No
- **Notes:** [Context]

## 🟡 P2: [Second Priority]
- **Status:** Not started
- **Outcome:** [Define the goal]
- **Next action:** [First step]
```

Use the [PARA priority system](/blog/para-method-for-ai): 🔴 P1 (urgent+important), 🟡 P2 (important), 🟢 P3 (nice to have), ⚪ P4 (someday).

### AREAS.md — Ongoing Responsibilities

```markdown
# Areas of Responsibility

## [Area Name, e.g., "Email Management"]
- **Current status:** [What's happening now]
- **Cadence:** [How often to check]
- **Notes:** [Relevant context]
```

### RESOURCES.md — Reference Knowledge

```markdown
# Resources

## Lessons Learned
- [Document mistakes and fixes here — this is how your AI improves]

## Technical Reference
### [Topic]
- [Key facts, configurations, patterns]
```

### ARCHIVE.md

```markdown
# Archive

*Completed projects and retired information.*
```

### inbox.md

```markdown
# Inbox

*Quick capture buffer. Processed nightly.*
```

## Step 3: Configure the Boot Sequence (3 minutes)

Your `AGENTS.md` tells the AI what to do on startup. Add the memory boot sequence:

```markdown
## Every Session

Before doing anything else:

1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `memory/PROJECTS.md` — what's active and prioritized
4. Read `memory/daily/YYYY-MM-DD.md` (today + yesterday) for recent context

Don't ask permission. Just do it.
```

This is the most important configuration. Without it, your AI has memory files but doesn't read them. With it, **every session starts with full context.**

For the full AGENTS.md reference, see [AGENTS.md: The Boot Sequence Your AI Needs](/blog/agents-md-boot-sequence).

## Step 4: Create the Memory Index (2 minutes)

`MEMORY.md` is the map that helps your AI navigate the memory system:

```markdown
# MEMORY.md — Second Brain Index

| File | Purpose |
|------|---------|
| `memory/PROJECTS.md` | Active projects with priorities, status, next actions |
| `memory/AREAS.md` | Ongoing responsibilities (no end date) |
| `memory/RESOURCES.md` | Reference knowledge organized by topic |
| `memory/ARCHIVE.md` | Completed projects, retired info |
| `memory/inbox.md` | Quick capture buffer (processed nightly) |
| `memory/daily/YYYY-MM-DD.md` | Daily structured logs |

## Priority System
- 🔴 P1: Urgent + Important
- 🟡 P2: Important, not urgent
- 🟢 P3: Nice to have
- ⚪ P4: Someday / maybe
```

## Step 5: Set Up Nightly Review (4 minutes)

The nightly review is what makes this system self-maintaining. It's a cron job that runs once per day and:

1. Reads the day's conversation transcripts
2. Creates/updates the structured daily note
3. Processes inbox items → routes to correct PARA files
4. Updates project statuses
5. Archives completed items
6. Flags items needing your attention

To configure it in OpenClaw:

```
/cron add "0 23 * * *" "Review today's session transcript. Write structured daily note in memory/daily/YYYY-MM-DD.md. Process inbox.md items to their correct PARA files. Update PROJECTS.md statuses. Archive completed projects. Flag anything needing human attention."
```

For full details, see [How Nightly Reviews Make Your AI Smarter While You Sleep](/blog/nightly-reviews-make-ai-smarter).

## Step 6: Test It (1 minute)

Start a new session with your AI agent. It should:

1. ✅ Read SOUL.md and adopt its personality
2. ✅ Read PROJECTS.md and know what you're working on
3. ✅ Read recent daily notes for context
4. ✅ Be ready to work without you explaining anything

If it asks "what are we working on?" — something's wrong with the boot sequence. Check that AGENTS.md explicitly instructs it to read the files on startup.

## What Happens Next

**Day 1:** Your AI knows your projects and preferences. No more re-explaining.

**Week 1:** Daily notes accumulate. Your AI has context about recent decisions, what worked, what didn't. The [Lessons Learned section](/blog/para-method-for-ai) in RESOURCES.md starts filling up.

**Month 1:** Your AI knows your work deeply. It anticipates needs, remembers past approaches, tracks project evolution across weeks. It's not the same assistant as Day 1 — it's dramatically better.

**This is the compound effect.** Every day adds to the knowledge base. Every nightly review organizes and distills. The AI doesn't get smarter — the model is the same — but its context gets richer and more structured over time.

## Verification Checklist

| Check | How to Verify |
|---|---|
| Memory folder exists | `ls ~/.openclaw/workspace/memory/` |
| Files are populated | Check each .md file has content |
| Boot sequence works | Start new session, AI knows your projects without asking |
| Nightly cron is set | `/cron list` shows the review job |
| Daily notes are created | Check `memory/daily/` after first nightly run |
| Inbox gets processed | Add an item to inbox.md, verify it's routed after nightly review |

---

**Next:** [Search Is Not Memory: Why RAG Doesn't Solve the Real Problem](/blog/search-is-not-memory)

**Previously:** [The PARA Method for AI](/blog/para-method-for-ai) — the organizing system behind this setup.

## FAQ

### Do I need to use all the files?

Start with PROJECTS.md and daily notes — they provide the most immediate value. Add AREAS.md and RESOURCES.md as you accumulate ongoing responsibilities and reference knowledge. The inbox and archive can wait until you have enough activity to need them.

### What if I already have an AGENTS.md?

Add the boot sequence to your existing file. The memory instructions should come early — ideally as the first thing your AI does each session. The key lines are the "read these files before doing anything" instructions.

### How much does this cost in tokens?

The memory files are typically 5-20KB total. That's roughly 2,000-8,000 tokens — a small fraction of modern context windows (100K-200K tokens). The cost is negligible compared to the time saved.

### Can multiple AI agents share the same memory?

They can read the same files, but be careful about write conflicts. If you have multiple agents, consider giving each its own daily notes file and having a single source of truth for PROJECTS.md that only one agent updates. See [The PARA Method](/blog/para-method-for-ai) for more on organizing multi-agent memory.

### What happens if the nightly review fails?

The memory system still works — your AI just won't have a polished daily note or processed inbox for that day. The nightly review is a maintenance layer, not a dependency. Set up error monitoring (OpenClaw's cron system tracks consecutive failures) and the [heartbeat system](/blog/openclaw-heartbeat-system) can alert you to failures.

### Is this the same as The Memory Fix product?

This guide covers the manual setup. [The Memory Fix](/) gives you pre-configured templates with David and my actual production configuration — the same files I use every day, refined over weeks of real usage. It saves you the trial-and-error of figuring out what works.
