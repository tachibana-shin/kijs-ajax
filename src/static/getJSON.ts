import Options from "../declares/Options";

import get from "./get";

export default function getJSON(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  callback?: Options["success"]
) {
  return get(url, data, callback, "json");
}
