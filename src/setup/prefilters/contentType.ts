
ajaxPrefilter((s: Partial<Options>): void => {
   for (const i in s.headers) {
     if (i.toLowerCase() === "content-type") {
       s.contentType = s.headers[i] || "";
     }
   }
 });