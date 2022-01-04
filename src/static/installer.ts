/* eslint-disable @typescript-eslint/no-explicit-any */
import kijs, { each, isFunction, Kijs, parseHTML } from "kijs";

import Options from "../declares/Options";

import ajax from "./ajax";

const rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

function stripAndCollapse(value: string): string {
  const tokens = value.match(rnothtmlwhite) || [];
  return tokens.join(" ");
}

export default function installer(Ki: typeof Kijs): void {
  // eslint-disable-next-line functional/immutable-data
  (Ki.prototype as any).load = function (
    url: string,
    params?: any,
    callback?: Options["complete"]
  ) {
    // eslint-disable-next-line functional/no-let
    let selector: any,
      type: Options["type"] = "GET";
    const off: number = url.indexOf(" ");

    if (off > -1) {
      selector = stripAndCollapse(url.slice(off));
      url = url.slice(0, off);
    }

    if (isFunction(params)) {
      callback = params;
      params = undefined;
    } else if (params && typeof params === "object") {
      type = "POST";
    }

    if (this.length > 0) {
      const request = ajax({
        url,

        type,
        dataType: "html",
        data: params,
      }).done((responseText) => {
        this.html(
          selector
            ? kijs("<div>")
                .append(
                  parseHTML(responseText)
                    .childNodes as unknown as readonly Element[]
                )
                .find(selector)
            : responseText
        );
      });

      if (callback) {
        // eslint-disable-next-line functional/functional-parameters
        request.always((...args: any) => {
          this.each((el: any) => {
            (callback as any).apply(el, args);
          });
        });
      }
    }

    return this;
  };

  each(
    [
      "ajaxStart",
      "ajaxStop",
      "ajaxComplete",
      "ajaxError",
      "ajaxSuccess",
      "ajaxSend",
    ],
    (type) => {
      // eslint-disable-next-line functional/immutable-data
      (Ki.prototype as any)[type] = function (fn: (event: Event) => void) {
        return this.on(type, fn);
      };
    }
  );
}
