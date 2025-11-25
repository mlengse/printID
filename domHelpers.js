/**
 * DOM Helper Functions
 * Safe DOM query utilities with error handling and null checks
 * @version 0.3.0
 */

/**
 * Safely query a single DOM element
 * @param {string} selector - CSS selector
 * @param {Element|Document} root - Root element to query from (defaults to document)
 * @returns {Element|null} Found element or null
 */
function safeQuerySelector(selector, root = document) {
  try {
    if (!root) return null;
    return root.querySelector(selector);
  } catch (err) {
    console.warn(`[DOM Helper] Invalid selector: "${selector}"`, err);
    return null;
  }
}

/**
 * Safely query multiple DOM elements
 * @param {string} selector - CSS selector
 * @param {Element|Document} root - Root element to query from (defaults to document)
 * @returns {Element[]} Array of found elements (empty array if none)
 */
function safeQuerySelectorAll(selector, root = document) {
  try {
    if (!root) return [];
    return Array.from(root.querySelectorAll(selector));
  } catch (err) {
    console.warn(`[DOM Helper] Invalid selector: "${selector}"`, err);
    return [];
  }
}

/**
 * Safely get text content from an element
 * @param {string} selector - CSS selector
 * @param {Element|Document} root - Root element to query from (defaults to document)
 * @returns {string} Trimmed text content or empty string
 */
function safeText(selector, root = document) {
  const el = safeQuerySelector(selector, root);
  return el ? el.textContent.trim() : '';
}

/**
 * Safely get attribute value from an element
 * @param {string} selector - CSS selector
 * @param {string} attrName - Attribute name
 * @param {Element|Document} root - Root element to query from (defaults to document)
 * @returns {string|null} Attribute value or null
 */
function safeAttr(selector, attrName, root = document) {
  const el = safeQuerySelector(selector, root);
  return el ? el.getAttribute(attrName) : null;
}

/**
 * Safely get element by ID
 * @param {string} id - Element ID
 * @param {Document} doc - Document to query from (defaults to document)
 * @returns {Element|null} Found element or null
 */
function safeGetById(id, doc = document) {
  try {
    if (!doc) return null;
    return doc.getElementById(id);
  } catch (err) {
    console.warn(`[DOM Helper] Error getting element by ID: "${id}"`, err);
    return null;
  }
}

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Element>} Promise that resolves with the element
 */
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = safeQuerySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = safeQuerySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
}
