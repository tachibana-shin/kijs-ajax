import oldCallbacks from "./constants/oldCallbacks";

const expando = (Math.random() * Number.MAX_SAFE_INTEGER).toString(34);

ajaxSetup({
  jsonp: "callback",
  jsonpCallback() {
    const callback = oldCallbacks.pop() || expando + "_" + nonce.guid++;
    this[callback] = true;
    return callback;
  },
});
