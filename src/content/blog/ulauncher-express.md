---
title: "Ulauncher Express: Staying in Flow State"
description: "Building a keyboard-first AI and search layer on top of Ulauncher to eliminate context switching and maintain deep work."
date: 2026-01-12
tags: ["productivity", "ulauncher", "keyboard", "linux", "ai", "tools"]
---

## The Problem: Context Switching Kills Productivity

I've always been obsessed with keyboard-driven workflows. There's something magical about keeping your hands on the keyboard, never reaching for the mouse, never breaking focus. Tools like SurfingKeys and Vivaldi Browser have transformed how I work—every action has a shortcut, every shortcut is customizable, and every millisecond saved staying focused compounds into hours of deep work.

But then I'd hit a wall. I'd need to search something, open a link, or ask an AI a question, and suddenly I'm Alt+Tabbing, scrolling through browser tabs, losing my train of thought. The friction is tiny but fatal to flow state.

That's when I discovered Google's Gemini AI in Chrome. With a single `Alt+G`, a sleek window appears with the context of your current page. Ask a question. Get an answer. `Esc` to dismiss. No browser switching, no context loss, no friction. It's exactly what an AI assistant should feel like.

I wanted this *everywhere* in my workflow. So I built it into Ulauncher.

## Introducing Ulauncher Express

Ulauncher Express is a collection of lightweight, keyboard-first extensions to the already-excellent Ulauncher launcher. It's designed around a single principle: **never break focus**.

### What It Does

**Web Search Without Leaving Your Desktop** (`g`, `go`, `gg`)
- `g <query>` - Search Google and preview results in a small window (no browser switch)
- `go <query>` - Open Google search in your browser (explicit choice when you need full browser)
- `gg <query>` - Same as `go` (naming still being refined)

**Wikipedia Search** (`w`, `wo`) [In Progress]
- `w <query>` - Preview Wikipedia results in-app
- `wo <query>` - Open full Wikipedia in browser

**AI Assistant** (`a <query>`) [Core Feature]
- `a <query>` - Ask a question, get an LLM response in a lightweight window
- Uses local Ollama or remote HuggingFace (configurable)
- Stores one conversation at a time—press `Esc` to dismiss, `Meta+A` to continue, `a <prompt>` to start fresh
- Lightweight and distraction-free, inspired by Gemini's approach

**Terminal Commands** (`c <query>`) [Fully Integrated]
- `c <query>` - Run shell commands directly from Ulauncher
- Output displays in a terminal window
- No context switching needed

**File Manager Integration** [Fully Integrated]
- Navigate filesystem normally, then:
  - `Shift+Enter` on a directory → Opens in file manager
  - `Ctrl+Enter` on a directory → Opens in terminal at that location

### The Philosophy Behind It

[PLACEHOLDER: Screenshot of AI response window in action]

Most AI tools in browsers feel bolted-on. They're chat windows on the side, sidebar panels that distract from the page. They feel *heavy*.

Ulauncher Express is the opposite. It's modal and temporary. You invoke it, use it, dismiss it. The window is sized appropriately—not taking over your screen, not hiding behind other windows. It's there when you need it, invisible when you don't.

This mirrors how keyboard-driven tools should work: shortcuts that feel like they were part of the OS all along, not tacked on.

### Current Status

**Fully Working:**
- ✅ `a <prompt>` - AI queries with Ollama/HuggingFace
- ✅ `g <prompt>` - Google preview window
- ✅ `gg <prompt>` / `go <prompt>` - Open in browser
- ✅ `c <prompt>` - Terminal command execution
- ✅ File manager shortcuts (Shift+Enter, Ctrl+Enter)
- ✅ Icon fixes in Ulauncher UI
- ✅ Window resizing and moving

**In Progress:**
- 🟡 `w <query>` / `wo <query>` - Wikipedia search
- 🟡 Remote vs. local LLM selection in settings
- 🟡 AI chat history persistence (up to 1 conversation)
- 🟡 Settings UI for model + system prompt customization

**TODO:**
- ⚪ Command history with `!` syntax (like shell history)
- ⚪ Full conversation history storage
- ⚪ Extended LLM model options

[PLACEHOLDER: Screenshot showing settings panel with window size and model options]

## Under the Hood

The implementation is surprisingly clean. Each feature is a "mode" in Ulauncher:

```
Query: "a explain kubernetes"
    ↓
AIQueryMode.matches_query_str("a explain kubernetes") → True
    ↓
AIQueryMode.handle_query() → Sends prompt to local Ollama or HuggingFace
    ↓
AIWindow displays response in styled window
    ↓
Press Esc → Dismiss (conversation saved)
Press Meta+A → Reopen existing conversation
Type "a <new prompt>" → Start fresh conversation
```

The same pattern works for web search—`g` queries open a preview window with WebKit2GTK rendering actual Google results, CSS styling and all. No screenshots, no static HTML. Real, live web content.

## Why This Matters

Productivity tools often miss the point. They add features without considering the *cost* of context switching. Every Alt+Tab, every mouse movement, every visual distraction pulls you out of deep work.

Ulauncher Express is built on the opposite philosophy: **get in, get your answer, get out**. The window pops up, you read the AI response or search results, you press Esc, you're back to what you were doing. Fifteen seconds of distraction instead of five minutes.

It's the same reason I switched to Vivaldi, the same reason I use keyboard extensions, the same reason I love Linux with keyboard-driven tiling window managers. It's all about removing friction from focus.

## What's Next

The core features are solid. What's coming:

- Wikipedia search (same preview window paradigm)
- Settings panel for customizing LLM models and system prompts
- Command history with the `!` syntax (like shell history)
- Persistent chat context (storing full conversation history)
- Icon consistency fixes across the board

[PLACEHOLDER: Roadmap diagram or feature timeline]

## Try It

If you're a keyboard enthusiast, someone who's ever felt frustrated by having to switch contexts just to search something, or you love being in flow state, this might be for you.

Ulauncher Express is still in active development, but the core AI and search features are ready and working well.

The goal is simple: **never break focus again**.

---

*Have thoughts on flow state and keyboard workflows? What's your setup look like? Drop me a message.*
