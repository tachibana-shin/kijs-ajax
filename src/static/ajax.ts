/* eslint-disable @typescript-eslint/no-explicit-any */
import kijs, { Kijs, toParam } from "kijs";

import allTypes from "../constants/allTypes";
import prefilters from "../constants/prefilters";
import transports from "../constants/transports";
import Options from "../declares/Options";
import XHR from "../declares/XHR";
import inspectPrefiltersOrTransports from "../helpers/inspectPrefiltersOrTransports";

import ajaxSetup from "./ajaxSetup";
import etag from "./etag";
import lastModified from "./lastModified";

const r20 = /%20/g,
  rhash = /#.*$/,
  rantiCache = /([?&])_=[^&]*/,
  reader = /^(.*?):[ \t]*([^\r\n]*)$/gm,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  originAnchor = new URL("./", location.href),
  rnothtmlwhite = /[^\x20\t\r\n\f]+/g,
  rquery = /\?/;

// eslint-disable-next-line functional/no-let
let active = 0,
  guid = 0;

function ajaxHandleResponses(
  s: Partial<Options>,
  likeXHR: XHR,
  responses: Record<string, any>
): any {
  // eslint-disable-next-line functional/no-let
  let ct, finalDataType, firstDataType;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const contents = s.contents!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dataTypes = s.dataTypes!;

  // eslint-disable-next-line functional/no-loop-statement
  while (dataTypes && dataTypes[0] === "*") {
    // eslint-disable-next-line functional/immutable-data
    dataTypes.shift();
    if (ct === undefined) {
      ct = s.mimeType || likeXHR.getResponseHeader("Content-Type");
    }
  }

  if (ct) {
    // eslint-disable-next-line functional/no-loop-statement
    for (const type in contents) {
      if (
        contents[type] &&
        typeof contents[type] !== "boolean" &&
        (contents[type] as RegExp).test(ct)
      ) {
        // eslint-disable-next-line functional/immutable-data
        dataTypes.unshift(type);
        break;
      }
    }
  }

  if (dataTypes[0] in responses) {
    finalDataType = dataTypes[0];
  } else {
    // eslint-disable-next-line functional/no-loop-statement
    for (const type in responses) {
      if (!dataTypes[0] || s.converters?.[type + " " + dataTypes[0]]) {
        finalDataType = type;
        break;
      }
      if (!firstDataType) {
        firstDataType = type;
      }
    }

    finalDataType = finalDataType || firstDataType;
  }

  if (finalDataType) {
    if (finalDataType !== dataTypes[0]) {
      // eslint-disable-next-line functional/immutable-data
      dataTypes.unshift(finalDataType);
    }
    return responses[finalDataType];
  }
}

function ajaxConvert(
  s: Partial<Options>,
  response: string,
  likeXHR: XHR,
  isSuccess: boolean
):
  | {
      readonly state: string;
      readonly data: any;
    }
  | {
      readonly state: string;
      readonly error: any;
    } {
  // eslint-disable-next-line functional/no-let
  let conn2, current, conc, tmp, prev;
  const converters: Required<typeof s>["converters"] = {},
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dataTypes = s.dataTypes!.slice();

  if (dataTypes[1]) {
    // eslint-disable-next-line functional/no-loop-statement
    for (const conc in s.converters) {
      // eslint-disable-next-line functional/immutable-data
      converters[conc.toLowerCase()] = s.converters[conc];
    }
  }

  // eslint-disable-next-line functional/immutable-data
  current = dataTypes.shift();

  // eslint-disable-next-line functional/no-loop-statement
  while (current) {
    if (s.responseFields?.[current]) {
      // eslint-disable-next-line functional/immutable-data
      likeXHR[s.responseFields[current]] = response;
    }

    if (!prev && isSuccess && s.dataFilter) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      response = s.dataFilter(response, s.dataType!);
    }

    prev = current;
    // eslint-disable-next-line functional/immutable-data
    current = dataTypes.shift();

    if (current) {
      if (current === "*") {
        current = prev;
      } else if (prev !== "*" && prev !== current) {
        conc = converters[prev + " " + current] || converters["* " + current];

        if (!conc) {
          // eslint-disable-next-line functional/no-loop-statement
          for (conn2 in converters) {
            tmp = conn2.split(" ");
            if (tmp[1] === current) {
              conc =
                converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
              if (conc) {
                if (conc === true) {
                  conc = converters[conn2];
                } else if (converters[conn2] !== true) {
                  current = tmp[0];
                  // eslint-disable-next-line functional/immutable-data
                  dataTypes.unshift(tmp[1]);
                }
                break;
              }
            }
          }
        }

        if (conc !== true) {
          if (conc && s.throws) {
            response = conc(response);
          } else {
            try {
              if (!conc) {
                // eslint-disable-next-line functional/no-throw-statement
                throw new Error("");
              }
              response = conc(response);
            } catch (e) {
              return {
                state: "parsererror",
                error: conc
                  ? e
                  : "No conversion from " + prev + " to " + current,
              };
            }
          }
        }
      }
    }
  }

  return { state: "success", data: response };
}

function ajax<Context = XHR>(
  url: string,
  options: Exclude<Partial<Options<Context>>, "url">
): XHR;
function ajax<Context = XHR>(options: Partial<Options<Context>>): XHR;

function ajax<Context = XHR>(
  url: any,
  options?: Partial<Options<Context>>
): XHR {
  if (typeof url === "object") {
    options = url;
    url = undefined;
  }

  options = options || {};

  // eslint-disable-next-line functional/no-let
  let transport: any,
    cacheURL: string,
    responseHeadersString: string,
    // eslint-disable-next-line functional/prefer-readonly-type
    responseHeaders: { [x: string]: any },
    timeoutTimer: number | undefined,
    completed = false,
    uncached;
  const s = ajaxSetup({}, options),
    callbackContext = s.context || s,
    globalEventContext =
      s.context &&
      ((callbackContext as Element).nodeType ||
        (callbackContext as unknown as Kijs).kijs)
        ? kijs(callbackContext)
        : kijs(window),
    statusCode = s.statusCode || {},
    // eslint-disable-next-line functional/prefer-readonly-type
    requestHeaders: { [x: string]: string } = {},
    // eslint-disable-next-line functional/prefer-readonly-type
    requestHeadersNames: { [x: string]: string } = {};
  // eslint-disable-next-line functional/no-let
  let resolveWith: (arg0: any) => void,
    rejectWith: (arg0: any) => void,
    strAbort = "canceled";
  const completeDeferred = new Set<Options["complete"]>(),
    likeXHR = new (class extends Promise<any> implements XHR {
      // static get [Symbol.species]() {
      //   return Promise;
      // }
      get [Symbol.toStringTag]() {
        return "XHR";
      }

      // eslint-disable-next-line functional/prefer-readonly-type
      readyState = 0;
      // eslint-disable-next-line functional/prefer-readonly-type
      [key: string]: any;
      // eslint-disable-next-line functional/prefer-readonly-type
      status = 0;

      constructor(
        cb = (resolve: any, reject: any) => {
          resolveWith = resolve;
          rejectWith = reject;
        }
      ) {
        super(cb);
      }

      getResponseHeader(key: string) {
        // eslint-disable-next-line functional/no-let
        let match;
        if (completed) {
          if (!responseHeaders) {
            responseHeaders = {};
            // eslint-disable-next-line functional/no-loop-statement
            while ((match = reader.exec(responseHeadersString))) {
              // eslint-disable-next-line functional/immutable-data
              responseHeaders[match[1].toLowerCase() + " "] = (
                responseHeaders[match[1].toLowerCase() + " "] || []
              ).concat(match[2]);
            }
          }
          match = responseHeaders[key.toLowerCase() + " "];
        }
        return match == null ? null : match.join(", ");
      }

      getAllResponseHeaders() {
        return completed ? responseHeadersString : null;
      }

      setRequestHeader(name: string, value: string) {
        if (completed == null) {
          // eslint-disable-next-line functional/immutable-data
          name = requestHeadersNames[name.toLowerCase()] =
            requestHeadersNames[name.toLowerCase()] || name;
          // eslint-disable-next-line functional/immutable-data
          requestHeaders[name] = value;
        }
        return this as unknown as XHR;
      }

      overrideMimeType(type: string) {
        if (completed == null) {
          // eslint-disable-next-line functional/immutable-data
          s.mimeType = type;
        }
        return this as unknown as XHR;
      }

      statusCode(map: Options["statusCode"]) {
        if (map) {
          if (completed) {
            resolveWith(map[likeXHR.status]);
          } else {
            // eslint-disable-next-line functional/no-loop-statement
            for (const code in map) {
              // eslint-disable-next-line functional/immutable-data
              statusCode[code] = [
                statusCode[code] as number,
                map[code] as number,
              ];
            }
          }
        }
        return this as unknown as XHR;
      }

      abort(statusText: string | undefined) {
        const finalText = statusText || strAbort;
        if (transport) {
          transport.abort(finalText);
        }
        done(0, finalText);
        return this as unknown as XHR;
      }

      done(cb: Options["success"]) {
        return (this as unknown as XHR).then(([data]) => {
          //success, statusText, likeXHR
          return (
            cb.call(
              callbackContext as any,
              data,
              (this as unknown as XHR).statusText,
              this as unknown as XHR
            ) || data
          );
        }) as unknown as XHR;
      }
      fail(cb: Options["error"]) {
        return (this as unknown as XHR).catch(([error]) => {
          //likeXHR, statusText, error
          return (
            cb.call(
              callbackContext as any,
              this as unknown as XHR,
              (this as unknown as XHR).statusText,
              error
            ) || error
          );
        }) as unknown as XHR;
      }
      always(cb: Options["success"] | Options["error"]) {
        // eslint-disable-next-line functional/no-let
        let completed = false;

        return (
          (this as unknown as XHR)
            // eslint-disable-next-line functional/functional-parameters
            .fail(function (...args) {
              completed = true;
              return (cb as Options["error"]).call(this, ...args) || args[0];
            })
            // eslint-disable-next-line functional/functional-parameters
            .done(function (...args) {
              if (completed === false) {
                return (
                  (cb as Options["success"]).call(this, ...args) || args[0]
                );
              }

              return args[0];
            }) as unknown as XHR
        );
      }
    })() as unknown as XHR<Context>;

  // eslint-disable-next-line functional/immutable-data
  s.url = ((url || s.url || location.href) + "").replace(
    rprotocol,
    location.protocol + "//"
  );

  // eslint-disable-next-line functional/immutable-data
  s.type = options.method || options.type || s.method || s.type;

  // eslint-disable-next-line functional/immutable-data
  s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];

  if (s.crossDomain == null) {
    const urlAnchor = document.createElement("a");

    try {
      // eslint-disable-next-line functional/immutable-data
      urlAnchor.href = s.url;

      // eslint-disable-next-line functional/immutable-data, no-self-assign
      urlAnchor.href = urlAnchor.href;
      // eslint-disable-next-line functional/immutable-data
      s.crossDomain =
        originAnchor.protocol + "//" + originAnchor.host !==
        urlAnchor.protocol + "//" + urlAnchor.host;
    } catch (e) {
      // eslint-disable-next-line functional/immutable-data
      s.crossDomain = true;
    }
  }

  if (
    s.data &&
    s.processData &&
    typeof s.data !== "string" &&
    s.data instanceof FormData === false
  ) {
    // eslint-disable-next-line functional/immutable-data
    s.data = toParam(s.data as Record<any, any>, s.traditional);
  }

  inspectPrefiltersOrTransports(prefilters, s, options, likeXHR);

  if (completed) {
    return likeXHR;
  }

  const fireGlobals = event && s.global;

  if (fireGlobals && active++ === 0) {
    globalEventContext.trigger("ajaxStart");
  }

  // eslint-disable-next-line functional/immutable-data
  s.type = (s.type?.toUpperCase() as Options["type"]) ?? "GET";

  // eslint-disable-next-line functional/immutable-data
  s.hasContent = !rnoContent.test(s.type);

  cacheURL = s.url.replace(rhash, "");

  if (!s.hasContent) {
    uncached = s.url.slice(cacheURL.length);

    if (s.data && (s.processData || typeof s.data === "string")) {
      cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

      // eslint-disable-next-line functional/immutable-data
      delete s.data;
    }

    if (s.cache === false) {
      cacheURL = cacheURL.replace(rantiCache, "$1");
      uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + guid++ + uncached;
    }

    // eslint-disable-next-line functional/immutable-data
    s.url = cacheURL + uncached;
  } else if (
    s.data &&
    s.processData &&
    (s.contentType?.toString() || "").indexOf(
      "application/x-www-form-urlencoded"
    ) === 0 &&
    typeof s.data === "string"
  ) {
    // eslint-disable-next-line functional/immutable-data
    s.data = s.data.replace(r20, "+");
  }

  if (s.ifModified) {
    if (lastModified.has(cacheURL)) {
      likeXHR.setRequestHeader(
        "If-Modified-Since",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        lastModified.get(cacheURL)!
      );
    }
    if (etag.has(cacheURL)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      likeXHR.setRequestHeader("If-None-Match", etag.get(cacheURL)!);
    }
  }

  if (
    (s.data && s.hasContent && s.contentType !== false) ||
    options.contentType
  ) {
    likeXHR.setRequestHeader("Content-Type", s.contentType as string);
  }

  likeXHR.setRequestHeader(
    "Accept",
    s.dataTypes[0] && s.accepts?.[s.dataTypes[0]]
      ? s.accepts[s.dataTypes[0]] +
          (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "")
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        s.accepts!["*"]
  );

  // eslint-disable-next-line functional/no-loop-statement
  for (const i in s.headers) {
    likeXHR.setRequestHeader(i, s.headers[i]);
  }

  if (
    s.beforeSend &&
    (s.beforeSend.call(callbackContext as any, likeXHR, s) === false ||
      completed)
  ) {
    return likeXHR.abort();
  }

  strAbort = "abort";

  if (s.complete) {
    completeDeferred.add(s.complete);
  }

  if (s.success) {
    likeXHR.done(s.success);
  }
  if (s.error) {
    likeXHR.fail(s.error);
  }

  transport = inspectPrefiltersOrTransports(transports, s, options, likeXHR);

  if (!transport) {
    done(-1, "No Transport");
  } else {
    // eslint-disable-next-line functional/immutable-data
    likeXHR.readyState = 1;

    if (fireGlobals) {
      globalEventContext.trigger("ajaxSend", [likeXHR, s]);
    }

    if (completed) {
      return likeXHR;
    }

    if (s.async && s.timeout && s.timeout > 0) {
      timeoutTimer = window.setTimeout(() => {
        likeXHR.abort("timeout");
      }, s.timeout);
    }

    try {
      completed = false;
      transport.send(requestHeaders, done);
    } catch (e) {
      if (completed) {
        // eslint-disable-next-line functional/no-throw-statement
        throw e;
      }

      done(-1, e);
    }
  }

  function done(
    status: number,
    nativeStatusText: unknown,
    responses?: Record<string, any>,
    headers?: string
  ) {
    // eslint-disable-next-line functional/no-let
    let isSuccess,
      success,
      error,
      response,
      modified,
      statusText = nativeStatusText;

    if (completed) {
      return;
    }

    completed = true;

    if (timeoutTimer) {
      window.clearTimeout(timeoutTimer);
    }

    transport = undefined;

    responseHeadersString = headers || "";

    // eslint-disable-next-line functional/immutable-data
    likeXHR.readyState = status > 0 ? 4 : 0;

    isSuccess = (status >= 200 && status < 300) || status === 304;

    if (responses) {
      response = ajaxHandleResponses(s, likeXHR, responses);
    }

    if (
      !isSuccess &&
      s.dataTypes?.includes("script") &&
      !s.dataTypes.includes("json") &&
      s.converters
    ) {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-empty-function
      s.converters["text script"] = () => {};
    }

    response = ajaxConvert(s, response, likeXHR, isSuccess);

    if (isSuccess) {
      if (s.ifModified) {
        modified = likeXHR.getResponseHeader("Last-Modified");
        if (modified) {
          lastModified.set(cacheURL, modified);
        }
        modified = likeXHR.getResponseHeader("etag");
        if (modified) {
          etag.set(cacheURL, modified);
        }
      }

      if (status === 204 || s.type === "HEAD") {
        statusText = "nocontent";
      } else if (status === 304) {
        statusText = "notmodified";
      } else {
        statusText = response.state;
        success = (response as any).data;
        error = (response as any).error;
        isSuccess = !error;
      }
    } else {
      error = statusText;
      if (status || !statusText) {
        statusText = "error";
        if (status < 0) {
          status = 0;
        }
      }
    }

    // eslint-disable-next-line functional/immutable-data
    likeXHR.status = status;
    // eslint-disable-next-line functional/immutable-data
    likeXHR.statusText = (nativeStatusText || statusText) + "";

    if (isSuccess) {
      // resolveWith(callbackContext, [success, statusText, likeXHR]);
      resolveWith([success, statusText, likeXHR, callbackContext]);
    } else {
      // rejectWith(callbackContext, [likeXHR, statusText, error]);
      rejectWith([error, statusText, likeXHR, callbackContext]);
    }

    likeXHR.statusCode(statusCode);

    if (fireGlobals) {
      globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [
        likeXHR,
        s,
        isSuccess ? success : error,
      ]);
    }

    completeDeferred.forEach((cb) =>
      cb.call(callbackContext as any, likeXHR, statusText as any)
    );

    if (fireGlobals) {
      globalEventContext.trigger("ajaxComplete", [likeXHR, s]);

      if (!--active) {
        globalEventContext.trigger("ajaxStop");
      }
    }
  }

  return likeXHR;
}

export default ajax;
export function getActive(): number {
  return active;
}
