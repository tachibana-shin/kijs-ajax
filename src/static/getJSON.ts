export default 
function getJSON(url: string, data?: any, callback?: Required<Options>["success"]) {
  return get(url, data, callback, "json");
}