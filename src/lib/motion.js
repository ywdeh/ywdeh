// Shared motion helpers, so every animation on the site answers to the same settings.

// true when the visitor has asked for less motion: animations then jump straight to their end
export function reduced_motion() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// a CSS time custom property (e.g. --press-time) in milliseconds, read from `element`, so script-driven
// motion keeps the same pace as the CSS transitions around it
export function css_time(element, name) {
    const value = getComputedStyle(element).getPropertyValue(name).trim();
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
}
