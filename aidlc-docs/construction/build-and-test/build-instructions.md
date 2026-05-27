# Build Instructions

## Prerequisites
- **Build Tool**: npm (Node.js package manager)
- **Node.js**: v18+ (ES modules support required)
- **Dependencies**: vitest ^3.1.4, fast-check ^4.1.1 (devDependencies)
- **Environment Variables**: None required
- **System Requirements**: Any modern OS with Node.js installed

## Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
No environment configuration needed — this is a static client-side game with no server-side components.

### 3. Build All Units
This project has no build step (no bundler). Source files are ES modules loaded directly by the browser. Verification is done through testing only.

```bash
# No build command needed — verify via tests
npm test
```

### 4. Verify Build Success
- **Expected Output**: All test files pass (13 files, 213+ tests)
- **Build Artifacts**: None (static files served directly)
- **Common Warnings**: None expected

## Serving the Game
To run the game locally, serve the workspace root with any static file server:

```bash
# Using Python
python3 -m http.server 8000

# Using npx
npx serve .

# Using Node.js http-server
npx http-server .
```

Then open `http://localhost:8000` in a browser.

## Troubleshooting

### Tests Fail with Module Resolution Errors
- **Cause**: Node.js version too old (needs ES module support)
- **Solution**: Upgrade to Node.js 18+

### Tests Fail with Import Errors
- **Cause**: Dependencies not installed
- **Solution**: Run `npm install` to install vitest and fast-check
