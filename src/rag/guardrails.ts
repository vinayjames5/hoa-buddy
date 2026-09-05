export type ScopeCheck =
  | {
      inScope: true;
    }
  | {
      inScope: false;
      message: string;
    };

const scopeMessage =
  "Please ask a question related to HOA rules, governing documents, community restrictions, architectural guidelines, assessments, board or homeowner responsibilities, or Florida Statutes Chapter 720.";

const listingSearchPatterns = [
  /\b(?:find|show|list|search)\s+(?:all\s+)?(?:the\s+)?(?:houses?|homes?|apartments?|condos?|rentals?)\s+(?:for\s+)?(?:rent|sale)\b/i,
  /\b(?:houses?|homes?|apartments?|condos?|rentals?)\s+for\s+(?:rent|sale)\b/i,
  /\b(?:zillow|redfin|realtor\.com|mls)\b/i,
  /\b(?:buy|sell)\s+(?:a\s+)?(?:house|home|condo)\b/i,
];

const domainTerms = [
  "hoa",
  "homeowners association",
  "association",
  "covenant",
  "covenants",
  "restriction",
  "restrictions",
  "declaration",
  "bylaw",
  "bylaws",
  "rule",
  "rules",
  "regulation",
  "regulations",
  "architectural",
  "arc",
  "approval",
  "improvement",
  "fence",
  "shed",
  "paint",
  "landscaping",
  "yard",
  "lot",
  "parcel",
  "owner",
  "homeowner",
  "board",
  "meeting",
  "vote",
  "assessment",
  "fine",
  "lien",
  "estoppel",
  "common area",
  "florida statute",
  "chapter 720",
  "720.",
  "hurricane protection",
  "flag",
  "parking",
  "vehicle",
  "lease",
  "leasing",
  "rental",
  "rent",
  "property manager",
];

export const checkQuestionScope = (question: string): ScopeCheck => {
  const normalized = question.trim().toLowerCase();

  if (normalized.length === 0) {
    return {
      inScope: false,
      message: "Question is required.",
    };
  }

  if (listingSearchPatterns.some((pattern) => pattern.test(normalized))) {
    return {
      inScope: false,
      message: `${scopeMessage} I cannot help with general real-estate listing searches or unrelated requests.`,
    };
  }

  if (domainTerms.some((term) => normalized.includes(term))) {
    return { inScope: true };
  }

  return {
    inScope: false,
    message: scopeMessage,
  };
};
