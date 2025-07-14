(function () {
  const eleReg = /<n8n-workflow src=(["'])(.*?)\1.*\/>/g;

  function concatenateUrlWithUrlObject(relativePath) {
    const baseUrl = window.location.href;
    try {
      const url = new URL(relativePath, baseUrl);
      return url.href;
    } catch (e) {
      console.error("Invalid URL or relative path:", e);
      return null; // Or throw an error
    }
  }

  function htmlEncode(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;") // Or &apos; but &#39; is more universally supported
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var n8nPlugin = function (hook, vm) {
    hook.beforeEach(function (content, next) {
      const matches = [...content.matchAll(eleReg)];
      const srcs = [...new Set(matches.map((match) => match[2]))];
      console.log(srcs);
      Promise.all(srcs.map((src) => fetch(src).then((res) => res.text()))).then(
        (data) => {
          const mapping = srcs.reduce((acc, src, i) => {
            acc[src] = data[i];
            return acc;
          }, {});
          next(
            content.replace(eleReg, (match, quote, src) => {
              const url = concatenateUrlWithUrlObject(src);
              if (!url) return match;
              return (
                `<n8n-demo workflow='${htmlEncode(
                  mapping[src]
                )}' frame=true theme='light'></n8n-demo>\n` +
                `> Workflow URL: <${url}>`
              );
            })
          );
        }
      );
    });
  };

  // Add plugin to docsify's plugin array
  $docsify = $docsify || {};
  $docsify.plugins = [].concat($docsify.plugins || [], n8nPlugin);
})();
