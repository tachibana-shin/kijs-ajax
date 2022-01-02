import ajaxSetup from "../static/ajaxExtend";

import oldCallbacks from "./constants/oldCallbacks";

const expando = (Math.random() * Number.MAX_SAFE_INTEGER).toString(34);
// eslint-disable-next-line functional/no-let
let guid = 0;

ajaxSetup({
  jsonp: "callback",
  jsonpCallback() {
    const callback = oldCallbacks.pop() || expando + "_" + guid++;
    // eslint-disable-next-line functional/immutable-data
    this[callback] = true;
    return callback;
  },
});
