import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import type { FloridaStatuteChunkMetadata } from "../models/document-metadata.js";
import { decodeHtml, htmlToText } from "../utils/html-to-text.js";

const baseUrl = "https://www.leg.state.fl.us";
const statuteYear = "2026";
const chapter = "720";
const chapterUrl = `${baseUrl}/Statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0720/0720.html`;

type StatuteSectionLink = {
  section: string;
  title: string;
  sourceUrl: string;
};

const chunkSize = 1000;
const chunkOverlap = 200;
const requestDelayMs = 300;
const maxFetchAttempts = 4;

const sleep = async (milliseconds: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const fetchText = async (url: string): Promise<string> => {
  for (let attempt = 1; attempt <= maxFetchAttempts; attempt += 1) {
    const response = await fetch(url);

    if (response.ok) {
      await sleep(requestDelayMs);
      return response.text();
    }

    if (response.status !== 429 || attempt === maxFetchAttempts) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const backoffMs = requestDelayMs * attempt * 4;
    console.log(`Rate limited fetching ${url}. Retrying in ${backoffMs}ms.`);
    await sleep(backoffMs);
  }

  throw new Error(`Failed to fetch ${url}.`);
};

const createSectionUrl = (section: string): string => {
  const [chapterPart, sectionPart] = section.split(".");

  if (!chapterPart || !sectionPart) {
    throw new Error(`Invalid statute section: ${section}`);
  }

  return `${baseUrl}/Statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0720/Sections/${chapterPart.padStart(
    4,
    "0",
  )}.${sectionPart}.html`;
};

const extractSectionBlocks = (html: string): string[] => {
  const startPattern =
    /<div class="Section"><span class="SectionNumber">720\.[\d]+[^<]*<\/span>/g;
  const starts = Array.from(html.matchAll(startPattern)).map((match) => match.index);
  const sectionBlocks: string[] = [];

  for (const [index, start] of starts.entries()) {
    if (start === undefined) {
      continue;
    }

    const end = starts[index + 1] ?? html.indexOf("</font>", start);
    sectionBlocks.push(html.slice(start, end));
  }

  return sectionBlocks;
};

const extractSection = (sectionHtml: string): StatuteSectionLink & {
  text: string;
} => {
  const headerMatch = sectionHtml.match(
    /<span class="SectionNumber">(?<section>720\.[^&<]+).*?<\/span>\s*<span class="Catchline">[\s\S]*?<span[^>]*class="CatchlineText">(?<title>[\s\S]*?)<\/span>/,
  );

  if (!headerMatch?.groups?.section || !headerMatch.groups.title) {
    throw new Error("Could not parse statute section heading.");
  }

  const section = decodeHtml(headerMatch.groups.section.trim());

  return {
    section,
    title: htmlToText(headerMatch.groups.title),
    sourceUrl: createSectionUrl(section),
    text: htmlToText(sectionHtml),
  };
};

export const loadFloridaStatuteSections = async (): Promise<
  Document<FloridaStatuteChunkMetadata>[]
> => {
  const retrievedDate = new Date().toISOString().slice(0, 10);
  const html = await fetchText(chapterUrl);
  const sections = extractSectionBlocks(html).map(extractSection);

  return sections.map((section) => {
    return (
      new Document({
        pageContent: section.text,
        metadata: {
          sourceType: "state-law",
          jurisdiction: "Florida",
          document: "Florida Statutes Chapter 720",
          section: section.section,
          title: section.title,
          sourceUrl: section.sourceUrl,
          retrievedDate,
          chunkIndex: 0,
        },
      })
    );
  });
};

export const loadFloridaStatuteChunks = async (): Promise<
  Document<FloridaStatuteChunkMetadata>[]
> => {
  const sections = await loadFloridaStatuteSections();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const chunks = await splitter.splitDocuments(sections);

  return chunks.map((chunk, chunkIndex) => {
    const metadata = chunk.metadata as FloridaStatuteChunkMetadata;

    return new Document({
      pageContent: chunk.pageContent,
      metadata: {
        ...metadata,
        chunkIndex,
      },
    });
  });
};

export const createFloridaStatuteChunkIds = (
  chunks: Document<FloridaStatuteChunkMetadata>[],
): string[] => {
  return chunks.map((chunk) => {
    const chunkIndex = String(chunk.metadata.chunkIndex).padStart(4, "0");
    return `fl-stat-${chunk.metadata.section}-c${chunkIndex}`;
  });
};
