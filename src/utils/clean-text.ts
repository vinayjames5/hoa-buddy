export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/^.*Landmark Web Official Records Search.*$/gim, "")
    .replace(/^\d{1,2}\/\d{1,2}\/\d{2,4},\s+\d{1,2}:\d{2}\s+[AP]M\s*$/gim, "")
    .replace(/^https:\/\/apps\.stjohnsclerk\.com\/Landmark\/search\/.*$/gim, "")
    .replace(/^BK:\s*\d+\s+PG:\s*\d+\s*$/gim, "")
    .replace(/^\s*\d+\/\d+\s*$/gim, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};