export default function addToPrefiltersOrTransports(structure: Record<string, Function[]>) {
  return function (dataTypeExpression: Function | string, func?: Function) {
    if (typeof dataTypeExpression !== "string") {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    const dataTypes =
      dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

    if (isFunction(func)) {
      let dataType,
        i = 0;
      while ((dataType = dataTypes[i++])) {
        if (dataType[0] === "+") {
          dataType = dataType.slice(1) || "*";
          (structure[dataType] = structure[dataType] || []).unshift(func);
        } else {
          (structure[dataType] = structure[dataType] || []).push(func);
        }
      }
    }
  };
}