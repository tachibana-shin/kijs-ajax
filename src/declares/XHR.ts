interface XHR extends Promise {
  readyState: string;
  getResponseHeader: (key: string) => null | string;

  getAllResponseHeaders: () => any | null;

  setRequestHeader: (name: string, value: string) => any;

  overrideMimeType: (type: string) => any;

  statusCode: (map: Record) => any;

  abort: (statusText: string) => any;

  always: (cb: Function) => any;
}

export default XHR;