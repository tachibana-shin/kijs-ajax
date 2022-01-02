const xhrSuccessStatus = {
  0: 200,
  1223: 204,
};
const xhrSupported = !!ajaxSettings.xhr();

ajaxTransport((options) => {
  // eslint-disable-next-line functional/no-let
  let callback: {
      (arg0: string | undefined): void;
      (type: any): () => void;
      (): void;
    } | null,
    errorCallback: { (): void; (): void } | null;

  if (support.cors || (xhrSupported && !options.crossDomain)) {
    return {
      send(headers: any, complete: any) {
        // eslint-disable-next-line functional/no-let
        let i;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const xhr = options.xhr!();

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
