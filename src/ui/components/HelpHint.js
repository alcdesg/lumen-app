class HelpHint {
  /**
   * Renders a discrete help icon with context tooltip.
   * @param {string} text The tooltip text.
   * @param {string} position The tooltip placement direction (top, bottom, left, right).
   * @returns {string} The HTML string representing the tooltip element.
   */
  static render(text, position = "top") {
    const cleanText = text.replace(/"/g, '&quot;');
    return `
      <span class="help-hint tooltip-${position}" data-tooltip="${cleanText}" role="tooltip">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="help-hint-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </span>
    `;
  }
}
