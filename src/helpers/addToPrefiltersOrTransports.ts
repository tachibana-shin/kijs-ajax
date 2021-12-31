import { isFunction } from "kijs";

const rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

// eslint-disable-next-line @typescript-eslint/ban-types
export default function addToPrefiltersOrTransports<Func extends Function>(
  // eslint-disable-next-line functional/prefer-readonly-type
  structure: Record<string, Func[]>
): {
  (dataTypeExpression: string, func: Func): void;
  (func: Func): void;
} {
  return function (dataTypeExpression: Func | string, func?: Func) {
    if (typeof dataTypeExpression !== "string") {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    const dataTypes =
      dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

    if (isFunction(func)) {
      // eslint-disable-next-line functional/no-let
      let dataType,
        i = 0;
      // eslint-disable-next-line functional/no-loop-statement
      while ((dataType = dataTypes[i++])) {
        if (dataType[0] === "+") {
          dataType = dataType.slice(1) || "*";
          // eslint-disable-next-line functional/immutable-data
          (structure[dataType] = structure[dataType] || []).unshift(func);
        } else {
          // eslint-disable-next-line functional/immutable-data
          (structure[dataType] = structure[dataType] || []).push(func);
        }
      }
    }
  };
}
