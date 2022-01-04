import Options from "./declares/Options";

declare module "kijs" {
  export type Support = {
    // eslint-disable-next-line functional/prefer-readonly-type
    cors: boolean;
    // eslint-disable-next-line functional/prefer-readonly-type
    ajax: boolean;
    // eslint-disable-next-line functional/prefer-readonly-type
    createHTMLDocument: boolean;
  };
}

declare module "kijs" {
  export class Kijs {
    load(
      url: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params?: any,
      callback?: Options["success"]
    ): this;
    ajaxStart(event: Event): this;
    ajaxStop(event: Event): this;
    ajaxComplete(event: Event): this;
    ajaxError(event: Event): this;
    ajaxSuccess(event: Event): this;
    ajaxSend(event: Event): this;
  }
}
