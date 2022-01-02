/* eslint-disable @typescript-eslint/no-explicit-any */
import kijs, { isFunction } from "kijs";

import ajaxPrefilter from "../../static/ajaxPrefilter";
import oldCallbacks from "../constants/oldCallbacks";

const rjsonp = /(=)\?(?=&|$)|\?\?/;
const rquery = /\?/;

ajaxPrefilter("json jsonp", (s, originalSettings, likeXHR) => {
  // eslint-disable-next-line functional/no-let
  let callbackName: string,
    overwritten: ((arg0: any) => void) | undefined,
    responseContainer: IArguments | readonly any[] | undefined;
  const jsonProp =
    s.jsonp !== false &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (rjsonp.test(s.url!)
      ? "url"
      : typeof s.data === "string" &&
        (s.contentType?.toString() || "").indexOf(
          "application/x-www-form-urlencoded"
        ) === 0 &&
        rjsonp.test(s.data) &&
        "data");

  if (jsonProp || s.dataTypes?.[0] === "jsonp") {
    // eslint-disable-next-line functional/immutable-data
    callbackName = s.jsonpCallback = isFunction(s.jsonpCallback)
      ? s.jsonpCallback()
      : s.jsonpCallback;

    if (jsonProp && typeof s[jsonProp] === "string") {
      // eslint-disable-next-line functional/immutable-data
      s[jsonProp] = (s[jsonProp] as any).replace(rjsonp, "$1" + callbackName);
    } else if (s.jsonp !== false) {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
      s.url += (rquery.test(s.url!) ? "&" : "?") + s.jsonp + "=" + callbackName;
    }

    if (!s.converters) {
      // eslint-disable-next-line functional/immutable-data
      s.converters = {};
    }

    // eslint-disable-next-line functional/immutable-data
    s.converters["script json"] = function () {
      if (!responseContainer) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error(callbackName + " was not called");
      }
      return responseContainer[0];
    };

    if (!s.dataTypes) {
      // eslint-disable-next-line functional/immutable-data
      s.dataTypes = [];
    }
    // eslint-disable-next-line functional/immutable-data
    s.dataTypes[0] = "json";

    overwritten = (window as any)[callbackName];
    // eslint-disable-next-line functional/immutable-data
    (window as any)[callbackName] = function () {
      // eslint-disable-next-line functional/functional-parameters, prefer-rest-params
      responseContainer = arguments;
    };

    likeXHR.always(function () {
      if (overwritten === undefined) {
        kijs(window).removeProp(callbackName);
      } else {
        // eslint-disable-next-line functional/immutable-data
        (window as any)[callbackName] = overwritten;
      }

      if ((s as any)[callbackName]) {
        // eslint-disable-next-line functional/immutable-data
        s.jsonpCallback = originalSettings.jsonpCallback;

        // eslint-disable-next-line functional/immutable-data
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
