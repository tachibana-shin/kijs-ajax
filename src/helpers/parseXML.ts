export default 
function parseXML(data: string): XMLDocument {
  let xml, parserErrorElem;
  if (!data || typeof data !== "string") {
    return null;
  }

  // Support: IE 9 - 11 only
  // IE throws on parseFromString with invalid input.
  try {
    xml = new window.DOMParser().parseFromString(data, "text/xml");
  } catch (e) {}

  parserErrorElem = xml && xml.getElementsByTagName("parsererror")[0];
  if (!xml || parserErrorElem) {
    throwerror(
      "Invalid XML: " +
        (parserErrorElem
          ? map(parserErrorElem.childNodes, (el) => el.textContent).join("\n")
          : data)
    );
  }
  return xml;
}