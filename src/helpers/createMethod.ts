export default function createMethod(method: string) {
  return function (
    url: string,
    data?: any,
    callback?: Required<Options>["success"],
    type: Required<Options>["type"] = "GET"
  ): XHR {
    if (isFunction(data)) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return ajax(
      extend(
        {
          url: url,
          type: method,
          dataType: type,
          data: data,
          success: callback,
        },
        isObject(url) && url
      )
    );
  };
}
