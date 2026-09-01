const htmlEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: "\"",
  x2003: " ",
  x2014: " - ",
};

const decodeHtmlEntity = (entity: string): string => {
  const key = entity.slice(1, -1);

  if (key in htmlEntities) {
    return htmlEntities[key] ?? entity;
  }

  if (key.startsWith("#x")) {
    return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
  }

  if (key.startsWith("#")) {
    return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
  }

  return entity;
};

export const decodeHtml = (html: string): string => {
  return html.replace(/&(?:#x[\da-f]+|#\d+|[a-z]+);/gi, decodeHtmlEntity);
};

export const htmlToText = (html: string): string => {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<\/(?:div|p|li|h[1-6])>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
};
