import Options from "../declares/Options";
import ajaxExtend from "../helpers/ajaxExtend";

import ajaxSettings from "./ajaxSettings";

function ajaxSetup(
  target: Partial<Options>,
  settings?: Partial<Options>
): Partial<Options> {
  if (settings) {
    return ajaxExtend(ajaxExtend(target, ajaxSettings), settings);
  }

  return ajaxExtend(ajaxSettings, target);
}

export default ajaxSetup;
