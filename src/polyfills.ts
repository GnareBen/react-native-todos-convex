// Clerk utilise navigator.onLine qui n'existe pas dans React Native
if (typeof navigator !== "undefined" && !("onLine" in navigator)) {
  Object.defineProperty(navigator, "onLine", {
    get: () => true,
    configurable: true,
  });
}
