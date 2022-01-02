
ajaxPrefilter("script", (s) => {
   if (s.cache === undefined) {
     s.cache = false;
   }
   if (s.crossDomain) {
     s.type = "GET";
   }
 });
 