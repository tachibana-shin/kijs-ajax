/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/prefer-readonly-type */

import XHR from "./XHR";

type Options<
  Data = string | Record<any, any> | Array<any> | FormData,
  DataType =
    | "xml"
    | "html"
    | "script"
    | "json"
    | "jsonp"
    | "text"
    | "arraybuffer"
    | "blob"
    | "document",
  TextStatus =
    | "success"
    | "notmodified"
    | "nocontent"
    | "error"
    | "timeout"
    | "abort"
    | "parsererror",
  Context = XHR
> = {
  accepts: {
    [key: string]: string;
  };
  async: boolean;
  beforeSend: (
    this: Context,
    xhr: XHR,
    options: Partial<Options>
  ) => void | false;
  cache: boolean;
  complete: (this: Context, xhr: XHR, textStatus: TextStatus) => void;
  contents: {
    [key: string]: RegExp;
  };
  contentType: boolean | string;
  context: Context;
  converters: {
    [key: string]: (this: Context, text: string) => any;
  };
  crossDomain: boolean;
  data: Data;
  dataFilter: (this: Context, data: Data, type: DataType) => any;
  error: (
    this: Context,
    xhr: XHR,
    textStatus: TextStatus,
    errorText: string
  ) => void;
  global: boolean;
  headers: {
    [key: string]: string;
  };
  ifModified: boolean;
  isLocal: boolean;
  jsonp: string | boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  jsonpCallback: string | Function;
  method: "GET" | "POST" | "PUT" | "DELETE";
  mimeType: string;
  password: string;
  processData: boolean;
  scriptAttrs: {
    [key: string]: string;
  };
  scriptCharset: string;
  statusCode: {
    [status: string | number]: (this: XHR) => void;
  };
  success: (this: Context, data: any, textStatus: TextStatus, xhr: XHR) => void;
  traditional: boolean;
  type: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  xhr: () => any;
  xhrFields: {
    [key: string]: boolean | string;
  };
  dataTypes: string[];
  username: string;
};

export default Options;
