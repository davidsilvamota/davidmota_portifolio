// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

// jsdom in CRA does not implement CSS.supports, but react-activity-calendar uses it.
if (typeof global.CSS === "undefined") {
  ;(global as typeof global & { CSS: { supports: () => boolean } }).CSS = {
    supports: () => true,
  }
} else if (typeof global.CSS.supports !== "function") {
  global.CSS.supports = () => true
}

if (typeof window.matchMedia !== "function") {
  window.matchMedia = () =>
    ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
