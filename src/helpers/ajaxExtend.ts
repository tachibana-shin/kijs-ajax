import { extend } from "kijs";

import Options from "../declares/Options";
import ajaxSettings from "../static/ajaxSettings";

export default function ajaxExtend(
  target: Partial<Options>,
  src: Partial<Options>
): Partial<Options> {
  // eslint-disable-next-line functional/no-let
  let deep;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatOptions: any = ajaxSettings.flatOptions || {};

  // eslint-disable-next-line functional/no-loop-statement
  for (const key in src) {
    if (src[key as keyof typeof src] !== undefined) {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
      ((flatOptions[key] ? target : deep || (deep = {})) as any)[key] =
        src[key as keyof typeof src];
    }
  }
  if (deep) {
    extend(true, target, deep);
  }

  return target;
}
