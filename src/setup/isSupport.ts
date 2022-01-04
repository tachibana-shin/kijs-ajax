import { support } from "kijs";

import ajaxSettings from "../static/ajaxSettings";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const xhrSupported = ajaxSettings.xhr!();

// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(support as any).cors = !!xhrSupported && "withCredentials" in xhrSupported;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(support as any).ajax = !!xhrSupported;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(support as any).createHTMLDocument = (() => {
  const body = document.implementation.createHTMLDocument("").body;
  // eslint-disable-next-line functional/immutable-data
  body.innerHTML = "<form></form><form></form>";
  return body.childNodes.length === 2;
})();
