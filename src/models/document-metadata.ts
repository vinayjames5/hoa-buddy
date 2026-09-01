export type SourceType = "hoa" | "state-law" | "county" | "federal";

export type HoaChunkMetadata = {
  sourceType: SourceType;
  jurisdiction: string;
  document: string;
  sourcePath: string;
  page: number;
  chunkIndex: number;
};
