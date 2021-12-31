/* eslint-disable functional/prefer-readonly-type */
import Options from "./Options";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XHR = Promise<any> & {
  readyState: string;
  getResponseHeader: (key: string) => null | string;

  getAllResponseHeaders: () => XHR | null;

  setRequestHeader: (name: string, value: string) => XHR;

  overrideMimeType: (type: string) => XHR;

  statusCode: (map: Options["statusCode"]) => XHR;

  abort: (statusText: string) => XHR;

  // eslint-disable-next-line @typescript-eslint/ban-types
  always: (cb: Function) => XHR;
};

export default XHR;
