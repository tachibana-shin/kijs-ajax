import kijs from "kijs";

import ajaxTransport from "../../static/ajaxTransport";

ajaxTransport("script", (s) => {
  if (s.crossDomain || s.scriptAttrs) {
    // eslint-disable-next-line functional/no-let, @typescript-eslint/ban-types
    let callback: Function | null;
    return {
      send(_, complete) {
        const script = kijs("<script>")
          .attr(s.scriptAttrs || {})
          .prop({ charset: s.scriptCharset, src: s.url })
          .on(
            "load error",
            (callback = (evt: Event) => {
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
