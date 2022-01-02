ajaxPrefilter((s) => {
  if (s.crossDomain) {
    s.contents.script = false;
  }
});
