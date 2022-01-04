import { support } from "kijs";

import ajaxSettings from "../../static/ajaxSettings";
import ajaxTransport from "../../static/ajaxTransport";

const xhrSuccessStatus = {
  0: 200,
  1223: 204,
};
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const xhrSupported = !!ajaxSettings.xhr!();

ajaxTransport((options) => {
  // eslint-disable-next-line functional/no-let, @typescript-eslint/ban-types
  let callback: Function | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((support as any).cors || (xhrSupported && !options.crossDomain)) {
    return {
      send(headers, complete) {
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
          // eslint-disable-next-line functional/no-loop-statement
          for (const i in options.xhrFields) {
            // eslint-disable-next-line functional/immutable-data
            xhr[i] = options.xhrFields[i];
          }
        }

        if (options.mimeType && xhr.overrideMimeType) {
          xhr.overrideMimeType(options.mimeType);
        }

        if (!options.crossDomain && !headers["X-Requested-With"]) {
          // eslint-disable-next-line functional/immutable-data
          headers["X-Requested-With"] = "XMLHttpRequest";
        }

        // eslint-disable-next-line functional/no-loop-statement
        for (const i in headers) {
          xhr.setRequestHeader(i, headers[i]);
        }

        callback = function (type: string) {
          return function () {
            if (callback) {
              callback =
                errorCallback =
                // eslint-disable-next-line functional/immutable-data
                xhr.onload =
                // eslint-disable-next-line functional/immutable-data
                xhr.onerror =
                // eslint-disable-next-line functional/immutable-data
                xhr.onabort =
                // eslint-disable-next-line functional/immutable-data
                xhr.ontimeout =
                // eslint-disable-next-line functional/immutable-data
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
                  xhrSuccessStatus[
                    xhr.status as keyof typeof xhrSuccessStatus
                  ] || xhr.status,
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

        // eslint-disable-next-line functional/immutable-data
        xhr.onload = callback();
        // eslint-disable-next-line  functional/no-let, @typescript-eslint/ban-types
        let errorCallback: Function | null =
          // eslint-disable-next-line functional/immutable-data
          (xhr.onerror =
          // eslint-disable-next-line functional/immutable-data
          xhr.ontimeout =
            callback("error"));

        if (xhr.onabort !== undefined) {
          // eslint-disable-next-line functional/immutable-data
          xhr.onabort = errorCallback;
        } else {
          // eslint-disable-next-line functional/immutable-data
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              window.setTimeout(function () {
                if (callback) {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  errorCallback!();
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
            // eslint-disable-next-line functional/no-throw-statement
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
