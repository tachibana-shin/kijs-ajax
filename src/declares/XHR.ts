/* eslint-disable functional/prefer-readonly-type */
import Options from "./Options";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XHR<Context = any> = Promise<any> & {
  readyState: number;
  status: number;
  getResponseHeader: (key: string) => null | string;

  getAllResponseHeaders: () => string | null;

  setRequestHeader: (name: string, value: string) => XHR;

  overrideMimeType: (type: string) => XHR;

  statusCode: (map: Options["statusCode"]) => XHR;

  abort: (statusText?: string) => XHR;

  done: (cb: Options<Context>["success"]) => XHR;
  fail: (cb: Options<Context>["error"]) => XHR;
  always: (cb: Options["success"] | Options["error"]) => XHR;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export default XHR;
