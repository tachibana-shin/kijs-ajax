import { map } from "kijs";

export default function parseXML(data: string): Document | null {
  if (!data || typeof data !== "string") {
    return null;
  }

  // eslint-disable-next-line functional/no-let
  let xml;
  try {
    xml = new window.DOMParser().parseFromString(data, "text/xml");
    // eslint-disable-next-line no-empty
  } catch {}

  const parserErrorElem = xml && xml.getElementsByTagName("parsererror")[0];
  if (!xml || parserErrorElem) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error(
      "Invalid XML: " +
        (parserErrorElem
          ? map(parserErrorElem.childNodes, (el) => el.textContent).join("\n")
          : data)
    );
  }
  return xml;
}
