import { Kijs, support } from "kijs";

declare module "kijs" {
  const support: {
    readonly cors: boolean;
    readonly ajax: boolean;
    readonly createHTMLDocument: boolean;
  };

  export { support }
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
