╔══════════════════════════════════════════════════╗
║        UQ Free Food Finder — Setup Guide         ║
╚══════════════════════════════════════════════════╝

WHY A LOCAL SERVER?
───────────────────
Browsers block direct calls to the Anthropic API from
HTML files due to CORS (Cross-Origin Resource Sharing).
This package includes a tiny Node.js proxy server that
forwards your API calls locally — no data ever leaves
your machine except to Anthropic directly.


REQUIREMENTS
────────────
  • Node.js (v14+)   → https://nodejs.org
  • An Anthropic API key → https://console.anthropic.com


SETUP (one-time)
────────────────
  No npm install needed! The server uses only built-in
  Node.js modules (http, https, fs, path, url).


START THE APP
─────────────
  macOS / Linux:
    1. Open Terminal
    2. cd into this folder
    3. Run:  node server.js
    4. Open: http://localhost:3747

  Windows:
    1. Open Command Prompt or PowerShell
    2. cd into this folder
    3. Run:  node server.js
    4. Open: http://localhost:3747


INSTALL AS PWA (optional)
──────────────────────────
  Once open in Chrome/Edge/Safari:
  • Chrome/Edge: Click the install icon (⊕) in the address bar
  • iOS Safari: Share → Add to Home Screen
  • Android Chrome: Menu (⋮) → Add to Home Screen


FIRST USE
─────────
  1. Start server.js (see above)
  2. Open http://localhost:3747 in your browser
  3. Tap ⚙️ Settings
  4. Enter your Anthropic API key (starts with sk-ant...)
  5. Tap 💾 Save API Key
  6. Tap 🔍 Scan tab
  7. Choose societies and tap "Scan for Food Events"
  8. Results appear on the 🏠 Home tab!


FILES
─────
  index.html          — The PWA app
  server.js           — Local CORS proxy (Node.js, no deps)
  manifest.webmanifest — PWA install manifest
  icon.svg            — App icon
  README.txt          — This file


TROUBLESHOOTING
───────────────
  "Proxy not running" snackbar:
    → Make sure you ran: node server.js

  Port 3747 already in use:
    → macOS/Linux: lsof -ti:3747 | xargs kill
    → Windows:     netstat -ano | findstr :3747
                   taskkill /PID <pid> /F

  API key error:
    → Check your key starts with sk-ant...
    → Verify it has active credits at console.anthropic.com

  No events found:
    → Societies may not have posted recently
    → Try again closer to semester events
