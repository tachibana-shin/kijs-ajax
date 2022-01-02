// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Kijs, Support } from "kijs";

declare module "kijs" {
  type Old = Support;
  // eslint-disable-next-line functional/prefer-type-literal
  interface Support extends Old {
    // eslint-disable-next-line functional/prefer-readonly-type
    cors: boolean;
    // eslint-disable-next-line functional/prefer-readonly-type
    ajax: boolean;
    // eslint-disable-next-line functional/prefer-readonly-type
    createHTMLDocument: boolean;
  }
}

declare module "kijs" {
  class Kijs {
    load(
      url: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params?: any,
      callback?: Required<Options>["success"]
    ): this;
    readonly [
      name:
        | "ajaxStart"
        | "ajaxStop"
        | "ajaxComplete"
        | "ajaxError"
        | "ajaxSuccess"
        | "ajaxSend"
    ]: (event: Event) => Kijs;
  }
}
