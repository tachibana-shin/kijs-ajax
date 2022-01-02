import { support } from "kijs";

import ajaxSettings from "../static/ajaxSettings";

const xhrSupported = !!ajaxSettings.xhr();

// eslint-disable-next-line functional/immutable-data
support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
// eslint-disable-next-line functional/immutable-data
support.ajax = xhrSupported;
// eslint-disable-next-line functional/immutable-data
support.createHTMLDocument = (() => {
  const body = document.implementation.createHTMLDocument("").body;
  body.innerHTML = "<form></form><form></form>";
  return body.childNodes.length === 2;
})();
