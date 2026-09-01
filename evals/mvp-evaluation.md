# MVP Evaluation

Run:

```bash
npm run retrieval:smoke
```

Baseline result from the current MVP:

```text
Tests: 5
Top-1 keyword hits: 4/5
Top-5 keyword hits: 5/5
```

## Smoke Questions

1. What is an Improvement?
2. What is a Lot?
3. How does an owner get approval for a proposed improvement?
4. Who is responsible for maintaining exterior improvements?
5. What does the declaration say about assessments?

## Manual Demo Questions

Use:

```bash
npm run retrieve -- "<question>"
npm run rag:answer -- "<question>"
```

Recommended MVP demo questions:

1. What is an Improvement?
2. How does an owner get approval for a proposed improvement?
3. What does Florida law say about HOA architectural approval for improvements?
4. What does Florida law say about hurricane protection?
5. What does the declaration say about assessments?
6. Can the HOA deny something if the retrieved documents do not mention it?

## Known MVP Limitations

- Only one HOA governing PDF is loaded.
- HOA text depends on OCR quality.
- Retrieval is dense-vector only.
- No reranking yet.
- No UI yet.
- Florida law coverage is limited to Chapter 720.
- Citation quality needs more evaluation before real homeowner use.

## Pass Criteria

- Relevant source appears in top 5.
- Answer cites HOA pages or Florida statute sections.
- Answer does not invent unsupported legal conclusions.
- Unsupported questions should trigger insufficient-context behavior.

