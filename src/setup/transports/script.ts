ajaxTransport("script", (s) => {
  if (s.crossDomain || s.scriptAttrs) {
    let script, callback;
    return {
      send(_, complete) {
        script = kijs("<script>")
          .attr(s.scriptAttrs || {})
          .prop({ charset: s.scriptCharset, src: s.url })
          .on(
            "load error",
            (callback = function (evt) {
              script.remove();
              callback = null;
              if (evt) {
                complete(evt.type === "error" ? 404 : 200, evt.type);
              }
            })
          );

        document.head.appendChild(script[0]);
      },
      abort() {
        if (callback) {
          callback();
        }
      },
    };
  }
});
