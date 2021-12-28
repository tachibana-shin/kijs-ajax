const r20 = /%20/g,
  rhash = /#.*$/,
  rantiCache = /([?&])_=[^&]*/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm,
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  prefilters: Record<string, Function[]> = {},
  transports: Record<string, Function[]> = {},
  allTypes = "*/".concat("*"),
  originAnchor = new URL("./", location.href);





let active = 0;
const lastModified = new Map<string, number | string>();
const etag = new Map<string, number | string>();










export default installer;
export {
  active,
  lastModified,
  etag,
  ajaxSettings,
  ajaxSetup,
  ajaxPrefilter,
  ajaxTransport,
  ajax,
  getJSON,
  getScript,
  evalUrl,
};
