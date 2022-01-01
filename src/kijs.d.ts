import { support, Kijs } from "kijs";

declare module "kijs" {
  interface support {
    cors: boolean;
    ajax: boolean;
    createHTMLDocument: boolean;
  }
}

declare module "kijs" {
  interface Kijs {
    load: (
      url: string,
      params?: any,
      callback?: Required<Options>["success"]
    ) => Kijs;
    [
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
