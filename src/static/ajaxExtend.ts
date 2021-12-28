
function ajaxSetup(target: string, settings: Exclude<Options, "url">): void;

function ajaxSetup(settings: Options): void;

function ajaxSetup(target: Options, settings: Options): Options {
  if (settings) {
    return ajaxExtend(ajaxExtend(target, ajaxSettings), settings);
  }

  return ajaxExtend(ajaxSettings, target);
}

export default ajaxSetup;