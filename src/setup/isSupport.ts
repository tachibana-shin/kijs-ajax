import ajaxSettings from "../static/ajaxSettings";

const xhrSupported = !!ajaxSettings.xhr();

support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
support.ajax = xhrSupported;
support.createHTMLDocument = (() => {
  const body = document.implementation.createHTMLDocument("").body;
  body.innerHTML = "<form></form><form></form>";
  return body.childNodes.length === 2;
})();
