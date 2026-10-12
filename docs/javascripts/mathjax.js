window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

if (typeof document$ !== "undefined" && typeof document$.subscribe === "function") {
  document$.subscribe(() => {
    if (typeof MathJax !== "undefined" && typeof MathJax.typesetPromise === "function") {
      MathJax.typesetPromise();
    }
  });
}
