export default function evalUrl(url: string, options?: Partial<Options>, doc: Document = document) {
  return ajax({
    url: url,

    type: "GET",
    dataType: "script",
    cache: true,
    async: false,
    global: false,

    converters: {
      "text script"() {},
    },
    dataFilter(response) {
      globalEval(response, options, doc);
    },
  });
}