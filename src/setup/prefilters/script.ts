import ajaxPrefilter from "../../static/ajaxPrefilter";

ajaxPrefilter("script", (s) => {
  if (s.cache === undefined) {
    // eslint-disable-next-line functional/immutable-data
    s.cache = false;
  }
  if (s.crossDomain) {
    // eslint-disable-next-line functional/immutable-data
    s.type = "GET";
  }
});
