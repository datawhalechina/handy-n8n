(function () {
  const eleReg = /<n8n-workflow src="([^"]+)".*\/>/g;
  var n8nPlugin = function (hook, vm) {
    hook.beforeEach(function (content, next) {
      const matches = [...content.matchAll(eleReg)];
      const srcs = [...new Set(matches.map((match) => match[1]))];
      Promise.all(srcs.map((src) => fetch(src).then((res) => res.text()))).then(
        (data) => {
          const mapping = srcs.reduce((acc, src, i) => {
            acc[src] = data[i];
            return acc;
          }, {});
          next(
            content.replace(eleReg, (match, src) => {
              return `<n8n-demo workflow='${mapping[src]}' frame=true>`;
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
