import ajaxPrefilter from "../../static/ajaxPrefilter";

ajaxPrefilter((s) => {
  if (s.crossDomain) {
    if (s.contents) {
      // eslint-disable-next-line functional/immutable-data
      s.contents.script = false;
    }
  }
});
