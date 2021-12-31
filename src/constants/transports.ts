import Options from "../declares/Options";
import XHR from "../declares/XHR";

const transports: Record<
  string,
  // eslint-disable-next-line functional/prefer-readonly-type
  ((
    settings: Partial<Options>,
    options: Partial<Options>,
    likeXhr: XHR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => string | void | any)[]
> = {};

export default transports;
