const r20 = /%20/g,
  rhash = /#.*$/,
  rantiCache = /([?&])_=[^&]*/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm,
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  originAnchor = new URL("./", location.href);

let active = 0;

function ajaxHandleResponses(
  s: Partial<Options>,
  likeXHR: XHR,
  responses: Response
): any {
  let ct,
    type,
    finalDataType,
    firstDataType,
    contents = s.contents,
    dataTypes = s.dataTypes;

  while (dataTypes[0] === "*") {
    dataTypes.shift();
    if (ct === undefined) {
      ct = s.mimeType || likeXHR.getResponseHeader("Content-Type");
    }
  }

  if (ct) {
    for (type in contents) {
      if (contents[type] && contents[type].test(ct)) {
        dataTypes.unshift(type);
        break;
      }
    }
  }

  if (dataTypes[0] in responses) {
    finalDataType = dataTypes[0];
  } else {
    for (type in responses) {
      if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
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
      dataTypes.unshift(finalDataType);
    }
    return responses[finalDataType];
  }
}

function ajaxConvert(
  s: Partial<Options>,
  response: Response,
  likeXHR: XHR,
  isSuccess: boolean
): {
  state: string;
  data: any;
} {
  let conv2,
    current,
    conv,
    tmp,
    prev,
    converters = {},
    dataTypes = s.dataTypes.slice();

  if (dataTypes[1]) {
    for (conv in s.converters) {
      converters[conv.toLowerCase()] = s.converters[conv];
    }
  }

  current = dataTypes.shift();

  while (current) {
    if (s.responseFields[current]) {
      likeXHR[s.responseFields[current]] = response;
    }

    if (!prev && isSuccess && s.dataFilter) {
      response = s.dataFilter(response, s.dataType);
    }

    prev = current;
    current = dataTypes.shift();

    if (current) {
      if (current === "*") {
        current = prev;
      } else if (prev !== "*" && prev !== current) {
        conv = converters[prev + " " + current] || converters["* " + current];

        if (!conv) {
          for (conv2 in converters) {
            tmp = conv2.split(" ");
            if (tmp[1] === current) {
              conv =
                converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
              if (conv) {
                if (conv === true) {
                  conv = converters[conv2];
                } else if (converters[conv2] !== true) {
                  current = tmp[0];
                  dataTypes.unshift(tmp[1]);
                }
                break;
              }
            }
          }
        }

        if (conv !== true) {
          if (conv && s.throws) {
            response = conv(response);
          } else {
            try {
              response = conv(response);
            } catch (e) {
              return {
                state: "parsererror",
                error: conv
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

function ajax(url: string, options: Exclude<Partial<Options>, "url">): XHR;
function ajax(options: Partial<Options>): XHR;

function ajax(url: string | Partial<Options>, options?: Partial<Options>): XHR {
  if (typeof url === "object") {
    options = url;
    url = undefined;
  }

  options = options || {};

  let transport,
    cacheURL,
    responseHeadersString,
    responseHeaders,
    timeoutTimer,
    urlAnchor,
    completed,
    fireGlobals,
    i,
    uncached,
    s = ajaxSetup({}, options),
    callbackContext = s.context || s,
    globalEventContext =
      s.context && (callbackContext.nodeType || callbackContext.kijs)
        ? kijs(callbackContext)
        : event,
    statusCode = s.statusCode || {},
    requestHeaders = {},
    requestHeadersNames = {},
    resolveWith,
    rejectWith,
    strAbort = "canceled",
    completeDeferred = new Set(),
    likeXHR = new (class extends Promise implements XHR {
      readyState = 0;
      done = this.then;
      failure = this.catch;

      constructor() {
        super((resolve, reject) => {
          resolveWith = resolve;
          rejectWith = reject;
        });
      }

      getResponseHeader(key) {
        let match;
        if (completed) {
          if (!responseHeaders) {
            responseHeaders = {};
            while ((match = rheaders.exec(responseHeadersString))) {
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

      setRequestHeader(name, value) {
        if (completed == null) {
          name = requestHeadersNames[name.toLowerCase()] =
            requestHeadersNames[name.toLowerCase()] || name;
          requestHeaders[name] = value;
        }
        return this;
      }

      overrideMimeType(type) {
        if (completed == null) {
          s.mimeType = type;
        }
        return this;
      }

      statusCode(map) {
        if (map) {
          if (completed) {
            promise.always(map[likeXHR.status]);
          } else {
            for (const code in map) {
              statusCode[code] = [statusCode[code], map[code]];
            }
          }
        }
        return this;
      }

      abort(statusText) {
        const finalText = statusText || strAbort;
        if (transport) {
          transport.abort(finalText);
        }
        done(0, finalText);
        return this;
      }

      always(cb) {
        let isError = false;

        this.catch((err) => {
          isError = true;
          return err;
        }).then((e) => {
          cb(e);

          if (isError) {
            throw e;
          }
        });
      }
    })();

  s.url = ((url || s.url || location.href) + "").replace(
    rprotocol,
    location.protocol + "//"
  );

  s.type = options.method || options.type || s.method || s.type;

  s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];

  if (s.crossDomain == null) {
    urlAnchor = document.createElement("a");

    try {
      urlAnchor.href = s.url;

      urlAnchor.href = urlAnchor.href;
      s.crossDomain =
        originAnchor.protocol + "//" + originAnchor.host !==
        urlAnchor.protocol + "//" + urlAnchor.host;
    } catch (e) {
      s.crossDomain = true;
    }
  }

  if (s.data && s.processData && typeof s.data !== "string") {
    s.data = toParam(s.data, s.traditional);
  }

  inspectPrefiltersOrTransports(prefilters, s, options, likeXHR);

  if (completed) {
    return likeXHR;
  }

  fireGlobals = event && s.global;

  if (fireGlobals && active++ === 0) {
    event.trigger("ajaxStart");
  }

  s.type = s.type.toUpperCase();

  s.hasContent = !rnoContent.test(s.type);

  cacheURL = s.url.replace(rhash, "");

  if (!s.hasContent) {
    uncached = s.url.slice(cacheURL.length);

    if (s.data && (s.processData || typeof s.data === "string")) {
      cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

      delete s.data;
    }

    if (s.cache === false) {
      cacheURL = cacheURL.replace(rantiCache, "$1");
      uncached =
        (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce.guid++ + uncached;
    }

    s.url = cacheURL + uncached;
  } else if (
    s.data &&
    s.processData &&
    (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0
  ) {
    s.data = s.data.replace(r20, "+");
  }

  if (s.ifModified) {
    if (lastModified.has(cacheURL)) {
      likeXHR.setRequestHeader(
        "If-Modified-Since",
        lastModified.get(cacheURL)!
      );
    }
    if (etag.has(cacheURL)) {
      likeXHR.setRequestHeader("If-None-Match", etag.get(cacheURL));
    }
  }

  if (
    (s.data && s.hasContent && s.contentType !== false) ||
    options.contentType
  ) {
    likeXHR.setRequestHeader("Content-Type", s.contentType);
  }

  likeXHR.setRequestHeader(
    "Accept",
    s.dataTypes[0] && s.accepts[s.dataTypes[0]]
      ? s.accepts[s.dataTypes[0]] +
          (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "")
      : s.accepts["*"]
  );

  for (i in s.headers) {
    likeXHR.setRequestHeader(i, s.headers[i]);
  }

  if (
    s.beforeSend &&
    (s.beforeSend.call(callbackContext, likeXHR, s) === false || completed)
  ) {
    return likeXHR.abort();
  }

  strAbort = "abort";

  completeDeferred.add(s.complete);
  likeXHR.done(s.success);
  likeXHR.fail(s.error);

  transport = inspectPrefiltersOrTransports(transports, s, options, likeXHR);

  if (!transport) {
    done(-1, "No Transport");
  } else {
    likeXHR.readyState = 1;

    if (fireGlobals) {
      globalEventContext.trigger("ajaxSend", [likeXHR, s]);
    }

    if (completed) {
      return likeXHR;
    }

    if (s.async && s.timeout > 0) {
      timeoutTimer = window.setTimeout(function () {
        likeXHR.abort("timeout");
      }, s.timeout);
    }

    try {
      completed = false;
      transport.send(requestHeaders, done);
    } catch (e) {
      if (completed) {
        throw e;
      }

      done(-1, e);
    }
  }

  function done(status, nativeStatusText, responses, headers) {
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

    likeXHR.readyState = status > 0 ? 4 : 0;

    isSuccess = (status >= 200 && status < 300) || status === 304;

    if (responses) {
      response = ajaxHandleResponses(s, likeXHR, responses);
    }

    if (
      !isSuccess &&
      s.dataTypes.includes("script") &&
      !s.dataTypes.includes("json")
    ) {
      s.converters["text script"] = function () {};
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
        success = response.data;
        error = response.error;
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

    likeXHR.status = status;
    likeXHR.statusText = (nativeStatusText || statusText) + "";

    if (isSuccess) {
      resolveWith(callbackContext, [success, statusText, likeXHR]);
    } else {
      rejectWith(callbackContext, [likeXHR, statusText, error]);
    }

    likeXHR.statusCode(statusCode);
    statusCode = undefined;

    if (fireGlobals) {
      globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [
        likeXHR,
        s,
        isSuccess ? success : error,
      ]);
    }

    completeDeferred.forEach((cb) =>
      cb(callbackContext, [likeXHR, statusText])
    );

    if (fireGlobals) {
      globalEventContext.trigger("ajaxComplete", [likeXHR, s]);

      if (!--active) {
        event.trigger("ajaxStop");
      }
    }
  }

  return likeXHR;
}

export default ajax;
