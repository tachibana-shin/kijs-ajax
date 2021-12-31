import { each } from "kijs";

import prefilters from "../constants/prefilters";
import transports from "../constants/transports";
import Options from "../declares/Options";
import XHR from "../declares/XHR";

export default function inspectPrefiltersOrTransports(
  structure: typeof transports | typeof prefilters,
  options: Partial<Options>,
  originalOptions: Partial<Options>,
  likeXHR: XHR
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inspected = {} as any,
    seekingTransport = structure === transports;

  function inspect(dataType: string): void | string {
    // eslint-disable-next-line functional/no-let
    let selected;
    // eslint-disable-next-line functional/immutable-data
    inspected[dataType] = true;
    each(structure[dataType] || [], (prefilterOrFactory) => {
      const dataTypeOrTransport = prefilterOrFactory(
        options,
        originalOptions,
        likeXHR
      );
      if (
        typeof dataTypeOrTransport === "string" &&
        !seekingTransport &&
        !inspected[dataTypeOrTransport]
      ) {
        // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
        options.dataTypes!.unshift(dataTypeOrTransport);
        inspect(dataTypeOrTransport);
        return false;
      } else if (seekingTransport) {
        return !(selected = dataTypeOrTransport);
      }
    });
    return selected;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return inspect(options.dataTypes![0]) || (!inspected["*"] && inspect("*"));
}
