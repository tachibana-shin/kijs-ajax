/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/prefer-readonly-type */

import XHR from "./XHR";

type Options<
  Context = any,
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
  Type = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS"
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
  contents: {
    [key: string]: RegExp | boolean;
  };
  contentType: false | string;
  context: Context;
  converters: {
    [key: string]: ((text: string) => any) | boolean;
  };
  crossDomain: boolean;
  data: Data;
  dataFilter: (data: Data, type: DataType) => any;
  success: (this: Context, data: any, textStatus: TextStatus, xhr: XHR) => any;
  error: (
    this: Context,
    xhr: XHR,
    textStatus: TextStatus,
    errorText: string
  ) => any;
  complete: (this: Context, xhr: XHR, textStatus: TextStatus) => any;
  global: boolean;
  headers: {
    [key: string]: string;
  };
  ifModified: boolean;
  isLocal: boolean;
  jsonp: string | boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  jsonpCallback: string | Function;
  method: Type;
  mimeType: string;
  password: string;
  processData: boolean;
  scriptAttrs: {
    [key: string]: string;
  };
  scriptCharset: string;
  statusCode: {
    [status: string | number]: number | [number, number];
  };
  traditional: boolean;
  type: Type;
  url: string;
  xhr: () => any;
  xhrFields: {
    [key: string]: boolean | string;
  };
  dataTypes: string[];
  dataType: DataType;
  username: string;
  responseFields: Record<string, any>;
  throws: any;
  hasContent: boolean;
  timeout: number;
  flatOptions: {
    [key in keyof Options]?: boolean;
  };
};

export default Options;
