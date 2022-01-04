import allTypes from "../constants/allTypes";
import Options from "../declares/Options";
import parseXML from "../helpers/parseXML";

const rlocalProtocol =
  /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;

const ajaxSettings: Partial<Options> = {
  url: location.href,
  type: "GET",
  isLocal: rlocalProtocol.test(location.protocol),
  global: true,
  processData: true,
  async: true,
  contentType: "application/x-www-form-urlencoded; charset=UTF-8",

  accepts: {
    "*": allTypes,
    text: "text/plain",
    html: "text/html",
    xml: "application/xml, text/xml",
    json: "application/json, text/javascript",
  },

  contents: {
    xml: /\bxml\b/,
    html: /\bhtml/,
    json: /\bjson\b/,
  },

  responseFields: {
    xml: "responseXML",
    text: "responseText",
    json: "responseJSON",
  },

  converters: {
    "* text": String,

    "text html": true,

    "text json": JSON.parse,

    "text xml": parseXML,
  },

  flatOptions: {
    url: true,
    context: true,
  },

  xhr() {
    try {
      return new XMLHttpRequest();
      // eslint-disable-next-line no-empty
    } catch {}
  },
};

export default ajaxSettings;
