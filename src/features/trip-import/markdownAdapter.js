import { unifiedSourceDocumentSchema } from "../../domain/trip/reviewSchema";

export const MAX_MARKDOWN_BYTES = 10 * 1024 * 1024;
export const EXTRACTION_TIMEOUT_MS = 20_000;

function sourceIdFor(filename, text) {
  let hash = 2166136261;
  for (const character of `${filename}\n${text}`) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `source-${(hash >>> 0).toString(36)}`;
}

export function validateMarkdownFile(file) {
  const extension = file.name.toLowerCase().endsWith(".md");
  const mime = !file.type || file.type === "text/markdown" || file.type === "text/plain";
  if (!extension || !mime) throw new Error("V0 目前只支援單一 Markdown (.md) 檔案。");
  if (file.size === 0) throw new Error("這個 Markdown 檔案是空的。");
  if (file.size > MAX_MARKDOWN_BYTES) throw new Error("Markdown 檔案不可超過 10 MiB。");
}

const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
function linksFrom(text) {
  return [...text.matchAll(linkPattern)].map((match) => ({ text: match[1], url: match[2] }));
}
function cells(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}
function isDivider(line) {
  return /^\s*\|?\s*:?-{3,}/.test(line) && line.includes("|");
}

function listItemFrom(line) {
  const match = line.match(/^([ \t]*)(?:(\d+)([.)])|([-*+]))\s+(.+)$/);
  if (!match) return null;
  const ordinal = match[2] ? Number(match[2]) : null;
  return {
    content: match[5],
    metadata: {
      kind: ordinal === null ? "unordered" : "ordered",
      marker: ordinal === null ? match[4] : `${match[2]}${match[3]}`,
      indent: match[1].replaceAll("\t", "    ").length,
      ...(ordinal === null ? {} : { ordinal }),
    },
  };
}

export function extractMarkdown(text, source) {
  if (text.includes("\u0000")) throw new Error("Markdown 內容不是可讀的 UTF-8 文字。");
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const lineNumber = index + 1;
    if (!line.trim()) { index += 1; continue; }
    if (line.includes("|") && index + 1 < lines.length && isDivider(lines[index + 1])) {
      const start = lineNumber;
      const rows = [cells(line)];
      index += 2;
      while (index < lines.length && lines[index].includes("|")) { rows.push(cells(lines[index])); index += 1; }
      blocks.push({ id: `block-${start}`, kind: "table", rows, links: rows.flatMap((row) => row.flatMap(linksFrom)), locator: { startLine: start, endLine: index } });
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const list = listItemFrom(line);
    const checkbox = list?.content.match(/^\[([ xX])\]\s+(.+)$/);
    const role = heading ? "heading" : checkbox ? "checkbox" : list ? "list_item" : "paragraph";
    const content = heading?.[2] ?? checkbox?.[2] ?? list?.content ?? line.trim();
    blocks.push({ id: `block-${lineNumber}`, kind: "text", role, text: content, ...(heading ? { level: heading[1].length } : {}), ...(checkbox ? { checked: checkbox[1].toLowerCase() === "x" } : {}), ...(list ? { list: list.metadata } : {}), links: linksFrom(content), locator: { startLine: lineNumber, endLine: lineNumber } });
    index += 1;
  }
  return unifiedSourceDocumentSchema.parse({ schemaVersion: 1, source, blocks });
}

export async function extractMarkdownFile(file) {
  validateMarkdownFile(file);
  let timeout;
  const text = await Promise.race([
    file.text(),
    new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error("Markdown 抽取超過 20 秒，請確認檔案後重試。")), EXTRACTION_TIMEOUT_MS);
    }),
  ]).finally(() => clearTimeout(timeout));
  if (!text.trim()) throw new Error("這個 Markdown 檔案是空的。");
  return extractMarkdown(text, { id: sourceIdFor(file.name, text), filename: file.name, mimeType: "text/markdown", size: file.size });
}
