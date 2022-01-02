ajaxSetup({
  accepts: {
    script:
      "text/javascript, application/javascript, " +
      "application/ecmascript, application/x-ecmascript",
  },
  contents: {
    script: /\b(?:java|ecma)script\b/,
  },
  converters: {
    "text script"(text) {
      globalEval(text);
      return text;
    },
  },
});
