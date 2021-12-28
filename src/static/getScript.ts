export default function getScript(url: string, callback?: Required<Options>["success"]) {
  return get(url, undefined, callback, "script");
}