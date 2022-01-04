import Options from "../declares/Options";

import get from "./get";

export default function getScript(url: string, callback?: Options["success"]) {
  return get(url, undefined, callback, "script");
}
