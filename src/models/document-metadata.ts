export type SourceType = "hoa" | "state-law" | "county" | "federal";

export type HoaChunkMetadata = {
  sourceType: SourceType;
  jurisdiction: string;
  document: string;
  sourcePath: string;
  page: number;
  chunkIndex: number;
};

export type FloridaStatuteChunkMetadata = {
  sourceType: "state-law";
  jurisdiction: "Florida";
  document: "Florida Statutes Chapter 720";
  section: string;
  title: string;
  sourceUrl: string;
  retrievedDate: string;
  chunkIndex: number;
};

export type SourceChunkMetadata = HoaChunkMetadata | FloridaStatuteChunkMetadata;
