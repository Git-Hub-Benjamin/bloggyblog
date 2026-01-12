---
title: "Building a Screen QR Code Scanner for Linux"
description: "Creating a Windows+Shift+S style QR code scanner - select a region, scan the code, open the link. No phone needed."
date: 2025-01-11
tags: ["linux", "kde", "tools", "productivity"]
---

I was working at my computer when I needed to scan a QR code from a webpage. On my phone, this is trivial - open the camera, point, done. But on my desktop? There was no quick way to do it. I'd have to pull out my phone, which breaks my workflow entirely.

I wanted something as seamless as **Windows+Shift+S** (the screenshot shortcut I use constantly for homework, sharing context with AI, etc.). What if I could just select a region of my screen and have it automatically detect and open QR codes?

## The Problem

QR codes are everywhere now - documentation links, authentication flows, sharing URLs. But desktop workflows for scanning them are surprisingly clunky:

- Use your phone (requires context switching)
- Upload a screenshot to an online service (slow, privacy concerns)
- Install a heavy browser extension (limited to browser content)

I wanted something **instant and universal** - works on any window, any content, triggered by a single keyboard shortcut.

## The Solution

A simple bash script that:
1. Lets you select a screen region (like screenshot tools)
2. Scans the selection for QR codes
3. Automatically opens URLs in your browser
4. Copies non-URL content to clipboard

Bound to **Meta+Shift+Q** for quick access.

## How It Works

The tool leverages existing Linux utilities rather than reinventing the wheel:

### The Components

- **Spectacle** - KDE's screenshot tool with region selection
- **zbar** - Fast QR code detection library
- **xdg-open** - Opens URLs in default browser
- **wl-clipboard** - Wayland clipboard integration
- **libnotify** - Desktop notifications

### The Script

Here's the core logic from [qr-scanner.sh](qr-scanner.sh):

```bash
#!/bin/bash
# Temporary file for the screenshot
TEMP_FILE=$(mktemp /tmp/qr-screenshot-XXXXXX.png)

# Capture screen region using spectacle
spectacle -r -b -n -o "$TEMP_FILE"

# Check if screenshot was taken
if [ ! -s "$TEMP_FILE" ]; then
    notify-send "QR Scanner" "Screenshot cancelled" -i dialog-warning
    exit 1
fi

# Detect QR code using zbar
QR_CONTENT=$(zbarimg --quiet --raw "$TEMP_FILE" 2>/dev/null)

# Check if QR code was found
if [ -z "$QR_CONTENT" ]; then
    notify-send "QR Scanner" "No QR code detected" -i dialog-error
    exit 1
fi

# If it's a URL, open it
if [[ "$QR_CONTENT" =~ ^https?:// ]]; then
    xdg-open "$QR_CONTENT"
else
    # Otherwise, copy to clipboard
    echo -n "$QR_CONTENT" | wl-copy
    notify-send "QR Scanner" "Content copied to clipboard" -i dialog-information
fi

# Cleanup
rm -f "$TEMP_FILE"
```

The script is straightforward:
1. Take a screenshot of the selected region
2. Feed it to `zbarimg` for QR detection
3. Open URLs automatically, copy everything else

### The Keyboard Shortcut

The magic is in the global keyboard shortcut setup. The [qr-scanner.desktop](qr-scanner.desktop) file registers the application with KDE:

```desktop
[Desktop Entry]
Name=QR Code Scanner
Exec=/home/benji/bin/qr-scanner.sh
Icon=camera-photo
Type=Application
Categories=Utility;

X-KDE-Shortcuts=Meta+Shift+Q
```

The [install.sh](install.sh) script configures the global shortcut:

```bash
kwriteconfig5 --file kglobalshortcutsrc \
    --group "qr-scanner.desktop" \
    --key "_launch" "Meta+Shift+Q,none,QR Code Scanner"
```

Now **Meta+Shift+Q** triggers the scanner from anywhere on the system.

## Usage

The workflow is incredibly smooth:

1. See a QR code on your screen (webpage, document, video call)
2. Press **Meta+Shift+Q**
3. Screen dims with crosshair cursor
4. Click and drag to select the QR code area
5. Release - the URL opens instantly

For non-URL QR codes (WiFi credentials, contact info), the content goes straight to your clipboard with a notification.

## Why This Approach Works

**Composability over complexity**: Instead of writing a custom screenshot tool and QR decoder from scratch, I used existing battle-tested utilities. The script is 40 lines of bash - simple, maintainable, and fast.

**Keyboard-first workflow**: No mouse hunting for apps or menus. The shortcut is muscle memory after a day of use.

**System-wide integration**: Works everywhere - browsers, PDFs, video calls, virtual machines. If it's on your screen, you can scan it.

## Installation

The whole thing is designed for easy setup. Clone the repo and run:

```bash
./install.sh
```

This handles:
- Installing dependencies (`zbar-tools`, `spectacle`, etc.)
- Copying scripts to `~/bin`
- Setting up the desktop entry
- Configuring the keyboard shortcut

Full instructions in the [README.md](README.md).

## Platform Notes

This is built for **KDE Plasma on Wayland**, which is what I run. The key dependencies are:

- **Spectacle** for region selection (KDE's native tool)
- **wl-clipboard** for Wayland clipboard access
- **zbar** for QR detection (works everywhere)

For other desktop environments, you'd swap out Spectacle for your native screenshot tool (GNOME Screenshot, maim, etc.). The QR detection logic is universal.

## What I Learned

**Shell scripting is underrated**: Modern bash with proper error handling is perfectly adequate for small utilities like this. No need for Python or a compiled language.

**Good UX requires thought**: The first version just printed the QR content to a notification. But auto-opening URLs makes it genuinely useful - one less step to think about.

**Existing tools are powerful**: I considered writing a custom Qt app with region selection and QR detection. But combining existing utilities got me 90% of the way there in an afternoon.

## Final Thoughts

This is now part of my daily workflow. I scan QR codes from documentation, video calls, and shared screens without touching my phone. Total project time: ~2 hours. Cost: $0.

The beauty of Linux desktop environments is this kind of extensibility. If you need a tool and it doesn't exist, you can build it in an evening.

---

**Project source**: Available on GitHub (link when you publish)  
**License**: MIT - see [LICENSE](LICENSE)
