import ajaxPrefilter from "../../static/ajaxPrefilter";

ajaxPrefilter((s) => {
  // eslint-disable-next-line functional/no-loop-statement
  for (const i in s.headers) {
    if (i.toLowerCase() === "content-type") {
      // eslint-disable-next-line functional/immutable-data
      s.contentType = s.headers[i] || "";
    }
  }
});
