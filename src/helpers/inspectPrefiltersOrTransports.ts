export default function inspectPrefiltersOrTransports(
  structure: Record<string, Function[]>,
  options: Partial<Options>,
  originalOptions: Partial<Options>,
  likeXHR: XHR
) {
  const inspected = {},
    seekingTransport = structure === transports;

  function inspect(dataType: string): void | string | Function {
    let selected;
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
        options.dataTypes.unshift(dataTypeOrTransport);
        inspect(dataTypeOrTransport);
        return false;
      } else if (seekingTransport) {
        return !(selected = dataTypeOrTransport);
      }
    });
    return selected;
  }

  return inspect(options.dataTypes[0]) || (!inspected["*"] && inspect("*"));
}
