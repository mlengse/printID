# Changelog

## [0.2.0] - 2025-11-25

### Fixed
- Fixed critical bug in `jsLabel2PDF.js` where assignment operators were used instead of comparison operators in conditional statements (`if (units="inches")` → `if (_units === "inches")`)
- Improved error handling in background script with proper catch blocks

### Changed
- **Security Improvement**: Replaced global window variable injection (`window.EXTENSION_PUSKESMAS_NAME`) with secure `chrome.runtime.sendMessage`/`onMessage` pattern
- Updated default Puskesmas name handling to use configurable settings from chrome.storage

### Added
- Added helper functions for safer DOM querying with null checks: `safeQuerySelector`, `safeText`, `safeQuerySelectorAll`
- Added development tooling: ESLint and Prettier configurations
- Added `package.json` with npm scripts for linting and formatting
- Added security best practices section in README
- Added this CHANGELOG file

### Developer Experience
- Created `.eslintrc.json` for code quality enforcement
- Created `.prettierrc.json` for consistent code formatting
- Created `.eslintignore` and `.prettierignore` files
- Added npm scripts: `lint`, `lint:fix`, `format`, `format:check`

## [0.1.0] - Previous releases
- Initial release with basic patient ID and medication label printing functionality
