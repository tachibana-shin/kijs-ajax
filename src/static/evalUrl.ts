import { globalEval } from "kijs";

import ajax from "./ajax";

export default function evalUrl(
  url: string,
  options?: HTMLScriptElement,
  doc: Document = document
) {
  return ajax({
    url: url,

    type: "GET",
    dataType: "script",
    cache: true,
    async: false,
    global: false,

    converters: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      "text script"() {},
    },
    dataFilter(response) {
      globalEval(response as string, options, doc);
    },
  });
}
