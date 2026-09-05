import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import { askQuestion } from "../rag/rag-service.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HOA Buddy</title>
    <style>
      body {
        margin: 0;
        background: #f6f7f9;
        color: #20242a;
        font-family: Arial, sans-serif;
      }
      main {
        max-width: 920px;
        margin: 0 auto;
        padding: 32px 20px;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 32px;
      }
      .subtitle {
        margin: 0 0 24px;
        color: #5b6470;
      }
      form {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      input {
        flex: 1;
        min-width: 0;
        padding: 14px 16px;
        border: 1px solid #c9d0d8;
        border-radius: 6px;
        font-size: 16px;
      }
      button {
        padding: 0 18px;
        border: 0;
        border-radius: 6px;
        background: #1f6feb;
        color: white;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
      .panel {
        border: 1px solid #d8dee6;
        border-radius: 8px;
        background: white;
        padding: 18px;
        margin-bottom: 16px;
      }
      .answer {
        white-space: pre-wrap;
        line-height: 1.55;
      }
      .source {
        border-top: 1px solid #edf0f3;
        padding-top: 12px;
        margin-top: 12px;
      }
      .source strong {
        display: block;
        margin-bottom: 4px;
      }
      .meta {
        color: #5b6470;
        font-size: 14px;
      }
      .error {
        color: #9b1c1c;
      }
      @media (max-width: 640px) {
        form {
          flex-direction: column;
        }
        button {
          min-height: 44px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>HOA Buddy</h1>
      <p class="subtitle">Ask questions grounded in HOA covenants and Florida Statutes Chapter 720.</p>
      <form id="ask-form">
        <input id="question" name="question" placeholder="Can I install a fence under the HOA rules?" autocomplete="off" />
        <button id="submit" type="submit">Ask</button>
      </form>
      <section class="panel">
        <h2>Answer</h2>
        <div id="answer" class="answer">Ask a question to start.</div>
      </section>
      <section class="panel">
        <h2>Retrieved Sources</h2>
        <div id="sources" class="meta">Sources will appear after retrieval.</div>
      </section>
    </main>
    <script>
      const form = document.querySelector("#ask-form");
      const input = document.querySelector("#question");
      const button = document.querySelector("#submit");
      const answer = document.querySelector("#answer");
      const sources = document.querySelector("#sources");

      const escapeHtml = (value) =>
        value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const question = input.value.trim();

        if (!question) return;

        button.disabled = true;
        answer.textContent = "Retrieving sources and generating grounded answer...";
        sources.textContent = "";

        try {
          const response = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Request failed.");
          }

          answer.textContent = data.answer;
          sources.innerHTML = data.sources.length === 0
            ? '<div class="meta">No sources retrieved. HOA Buddy only searches the loaded HOA documents and Florida Statutes Chapter 720 for in-scope HOA questions.</div>'
            : data.sources.map((source) => \`
              <div class="source">
                <strong>\${source.sourceNumber}. \${escapeHtml(source.document)}</strong>
                <div>\${escapeHtml(source.sourceType)} | \${escapeHtml(source.jurisdiction)} | \${escapeHtml(source.locator)} | score \${source.score.toFixed(6)}</div>
                <p>\${escapeHtml(source.preview)}</p>
              </div>
            \`)
            .join("");
        } catch (error) {
          answer.innerHTML = '<span class="error">' + escapeHtml(error.message) + '</span>';
        } finally {
          button.disabled = false;
        }
      });
    </script>
  </body>
</html>`;

const readRequestBody = async (request: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
};

const sendJson = (
  response: ServerResponse,
  statusCode: number,
  body: unknown,
): void => {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
};

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/") {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(html);
      return;
    }

    if (request.method === "POST" && request.url === "/api/ask") {
      const body = JSON.parse(await readRequestBody(request)) as {
        question?: unknown;
      };

      if (typeof body.question !== "string" || body.question.trim().length === 0) {
        sendJson(response, 400, { error: "Question is required." });
        return;
      }

      const result = await askQuestion(body.question.trim());
      sendJson(response, 200, result);
      return;
    }

    sendJson(response, 404, { error: "Not found." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    sendJson(response, 500, { error: message });
  }
});

server.listen(port, () => {
  console.log(`HOA Buddy chatbot running at http://localhost:${port}`);
});
