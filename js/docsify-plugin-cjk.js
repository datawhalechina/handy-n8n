(() => {
  const isNoBreak = (c) => {
    return "FWH".includes(eaw.eastAsianWidth(c));
  };
  function loadScript(id, src) {
    // Check if a script with the given ID already exists
    if (!document.getElementById(id)) {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.id = id;
        script.src = src;

        // Resolve the promise when the script loads successfully
        script.onload = () => resolve(script);

        // Reject the promise if there's an error during loading
        script.onerror = () =>
          reject(new Error(`Script load error for ${src}`));

        document.head.appendChild(script);
      });
    } else return Promise.resolve(src);
  }

  loadScript(
    "eaw",
    "https://cdn.jsdelivr.net/npm/eastasianwidth/eastasianwidth.js"
  ).then(() => {
    const plugin = (hook) => {
      hook.beforeEach((markdown) => {
        // merge lines when CJK characters are at the end of current line and
        // beginning of next line, to avoid space between CJK characters.
        return markdown.replace(
          /(\P{sc=Hangul})\r?\n(\P{sc=Hangul})/gu,
          (m, a, b) => {
            if (isNoBreak(a) && isNoBreak(b)) {
              return a + b;
            }
            return m;
          }
        );
      });
    };
    // Add plugin to docsify's plugin array
    $docsify = $docsify || {};
    $docsify.plugins = [].concat($docsify.plugins || [], plugin);
  });
})();
