import Options from "../declares/Options";
import XHR from "../declares/XHR";

const transports: Record<
  string,
  // eslint-disable-next-line functional/prefer-readonly-type
  ((
    settings: Partial<Options>,
    options: Partial<Options>,
    likeXhr: XHR
  ) =>
    | string
    | void
    | {
        readonly send: (
          headers: Record<string, string>,
          complete: (
            code: number,
            statusText: XMLHttpRequest["statusText"],
            response?:
              | string
              | {
                  readonly binary: XMLHttpRequest["response"];
                }
              | {
                  readonly text: string;
                },
            responseHeaders?: ReturnType<
              XMLHttpRequest["getAllResponseHeaders"]
            >
          ) => void
        ) => void;
        readonly abort: () => void;
      })[]
> = {};

export default transports;
