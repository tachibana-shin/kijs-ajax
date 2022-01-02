import oldCallbacks from "./constants/oldCallbacks";

const rjsonp = /(=)\?(?=&|$)|\?\?/;

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
