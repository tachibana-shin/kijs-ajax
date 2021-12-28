export default function ajaxExtend(target: Partial<Options>, src: Partial<Options>): Partial<Options> {
  let deep;
  const flatOptions = ajaxSettings.flatOptions || {};

  for (const key in src) {
    if (src[key] !== undefined) {
      (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
    }
  }
  if (deep) {
    extend(true, target, deep);
  }

  return target;
}