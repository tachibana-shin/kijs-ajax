ajaxPrefilter((s: Partial<Options>): void => {
  for (const i in s.headers) {
    if (i.toLowerCase() === "content-type") {
      s.contentType = s.headers[i] || "";
    }
  }
});

const xhrSuccessStatus = {
    0: 200,

    1223: 204,
  },
  xhrSupported = ajaxSettings.xhr();

isSupport.cors = !!xhrSupported && "withCredentials" in xhrSupported;
isSupport.ajax = xhrSupported = !!xhrSupported;

ajaxTransport((options) => {
  let callback, errorCallback;

  if (support.cors || (xhrSupported && !options.crossDomain)) {
    return {
      send(headers, complete) {
        let i,
          xhr = options.xhr();

        xhr.open(
          options.type,
          options.url,
          options.async,
          options.username,
          options.password
        );

        if (options.xhrFields) {
          for (i in options.xhrFields) {
            xhr[i] = options.xhrFields[i];
          }
        }

        if (options.mimeType && xhr.overrideMimeType) {
          xhr.overrideMimeType(options.mimeType);
        }

        if (!options.crossDomain && !headers["X-Requested-With"]) {
          headers["X-Requested-With"] = "XMLHttpRequest";
        }

        for (i in headers) {
          xhr.setRequestHeader(i, headers[i]);
        }

        callback = function (type) {
          return function () {
            if (callback) {
              callback =
                errorCallback =
                xhr.onload =
                xhr.onerror =
                xhr.onabort =
                xhr.ontimeout =
                xhr.onreadystatechange =
                  null;

              if (type === "abort") {
                xhr.abort();
              } else if (type === "error") {
                if (typeof xhr.status !== "number") {
                  complete(0, "error");
                } else {
                  complete(xhr.status, xhr.statusText);
                }
              } else {
                complete(
                  xhrSuccessStatus[xhr.status] || xhr.status,
                  xhr.statusText,

                  (xhr.responseType || "text") !== "text" ||
                    typeof xhr.responseText !== "string"
                    ? { binary: xhr.response }
                    : { text: xhr.responseText },
                  xhr.getAllResponseHeaders()
                );
              }
            }
          };
        };

        xhr.onload = callback();
        errorCallback = xhr.onerror = xhr.ontimeout = callback("error");

        if (xhr.onabort !== undefined) {
          xhr.onabort = errorCallback;
        } else {
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              window.setTimeout(function () {
                if (callback) {
                  errorCallback();
                }
              });
            }
          };
        }

        callback = callback("abort");

        try {
          xhr.send((options.hasContent && options.data) || null);
        } catch (e) {
          if (callback) {
            throw e;
          }
        }
      },

      abort() {
        if (callback) {
          callback();
        }
      },
    };
  }
});

ajaxPrefilter((s) => {
  if (s.crossDomain) {
    s.contents.script = false;
  }
});

ajaxSetup({
  accepts: {
    script:
      "text/javascript, application/javascript, " +
      "application/ecmascript, application/x-ecmascript",
  },
  contents: {
    script: /\b(?:java|ecma)script\b/,
  },
  converters: {
    "text script"(text) {
      globalEval(text);
      return text;
    },
  },
});

ajaxPrefilter("script", (s) => {
  if (s.cache === undefined) {
    s.cache = false;
  }
  if (s.crossDomain) {
    s.type = "GET";
  }
});

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

const oldCallbacks = [],
  rjsonp = /(=)\?(?=&|$)|\?\?/;

const expando = (Math.random() * Number.MAX_SAFE_INTEGER).toString(34);

ajaxSetup({
  jsonp: "callback",
  jsonpCallback() {
    const callback = oldCallbacks.pop() || expando + "_" + nonce.guid++;
    this[callback] = true;
    return callback;
  },
});

ajaxPrefilter("json jsonp", (s, originalSettings, likeXHR) => {
  let callbackName, overwritten, responseContainer;
  const jsonProp =
    s.jsonp !== false &&
    (rjsonp.test(s.url)
      ? "url"
      : typeof s.data === "string" &&
        (s.contentType || "").indexOf("application/x-www-form-urlencoded") ===
          0 &&
        rjsonp.test(s.data) &&
        "data");

  if (jsonProp || s.dataTypes[0] === "jsonp") {
    callbackName = s.jsonpCallback = isFunction(s.jsonpCallback)
      ? s.jsonpCallback()
      : s.jsonpCallback;

    if (jsonProp) {
      s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
    } else if (s.jsonp !== false) {
      s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
    }

    s.converters["script json"] = function () {
      if (!responseContainer) {
        throwerror(callbackName + " was not called");
      }
      return responseContainer[0];
    };

    s.dataTypes[0] = "json";

    overwritten = window[callbackName];
    window[callbackName] = function () {
      responseContainer = arguments;
    };

    likeXHR.always(function () {
      if (overwritten === undefined) {
        kijs(window).removeProp(callbackName);
      } else {
        window[callbackName] = overwritten;
      }

      if (s[callbackName]) {
        s.jsonpCallback = originalSettings.jsonpCallback;

        oldCallbacks.push(callbackName);
      }

      if (responseContainer && isFunction(overwritten)) {
        overwritten(responseContainer[0]);
      }

      responseContainer = overwritten = undefined;
    });

    return "script";
  }
});

isSpport.createHTMLDocument = (() => {
  const body = document.implementation.createHTMLDocument("").body;
  body.innerHTML = "<form></form><form></form>";
  return body.childNodes.length === 2;
})();
