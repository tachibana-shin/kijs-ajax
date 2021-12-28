export default 
function installer(Kijs: Kijs): void {
  Kijs.prototype.load = function (url: string, params?: any, callback?: Required<Options>["success"]) {
    let selector,
      type,
      response,
      self = this,
      off = url.indexOf(" ");

    if (off > -1) {
      selector = stripAndCollapse(url.slice(off));
      url = url.slice(0, off);
    }

    if (isFunction(params)) {
      callback = params;
      params = undefined;
    } else if (params && typeof params === "object") {
      type = "POST";
    }

    if (self.length > 0) {
      ajax({
        url: url,

        type: type || "GET",
        dataType: "html",
        data: params,
      })
        .done(function (responseText) {
          response = arguments;

          self.html(
            selector
              ? kijs("<div>").append(parseHTML(responseText)).find(selector)
              : responseText
          );
        })
        .always(
          callback &&
            function (likeXHR, status) {
              self.each(function () {
                callback.apply(
                  this,
                  response || [likeXHR.responseText, status, likeXHR]
                );
              });
            }
        );
    }

    return this;
  };

  each(
    [
      "ajaxStart",
      "ajaxStop",
      "ajaxComplete",
      "ajaxError",
      "ajaxSuccess",
      "ajaxSend",
    ],
    (type) => {
      Kijs.prototype[type] = function (fn) {
        return this.on(type, fn);
      };
    }
  );
}