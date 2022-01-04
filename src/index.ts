import "./kijs.declare";
// eslint-disable-next-line import/order
import Options from "./declares/Options";

import "./setup";
import ajax, { getActive } from "./static/ajax";
import ajaxPrefilter from "./static/ajaxPrefilter";
import ajaxSettings from "./static/ajaxSettings";
import ajaxSetup from "./static/ajaxSetup";
import ajaxTransport from "./static/ajaxTransport";
import etag from "./static/etag";
import evalUrl from "./static/evalUrl";
import getJSON from "./static/getJSON";
import getScript from "./static/getScript";
import installer from "./static/installer";
import lastModified from "./static/lastModified";

export default installer;
export {
  getActive,
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
export type { Options };
