// Puppeteer is a devDependency used only by scripts/smoke-ui.mjs (local regression net).
// Replit's npm install would otherwise download Chrome (~150 MB) on every deploy and can fail the build.
// REPL_ID is set on Replit; locally it is not, so the local smoke test keeps its browser.
module.exports = { skipDownload: Boolean(process.env.REPL_ID) };
