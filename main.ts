import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 200;
const folder = dirname(fileURLToPath(import.meta.url));
const source = join(folder, "one-line.txt");

function reject(why: string): never {
  console.error(`REJECTED: ${why}`);
  process.exit(1);
}

if (!existsSync(source)) reject("one-line.txt is not next to main.ts");

const rawText = readFileSync(source, "utf8");
const sentence = rawText.replace(/\r?\n$/, "");

if (sentence.length === 0) reject("the line is empty");
if (sentence.trim().length === 0) reject("the line is only whitespace");
if (sentence.length > MAX_CHARS) {
  reject(`the line is ${sentence.length} characters, over the ${MAX_CHARS} limit`);
}
if (/[\r\n]/.test(sentence)) reject("the line must not span more than one line");
if (sentence.startsWith(" ") || sentence.endsWith(" ")) {
  reject("the line has a leading or trailing space");
}
if (/  /.test(sentence)) reject("the line has a doubled space");
const closing = sentence.replace(/['"”’]+$/, "");
// A quoted line ends with the quote, not the full stop, so the punctuation
// check looks at the sentence with its closing quotes peeled off.
if (!/[.!?]$/.test(closing)) reject("the line must close with . ! or ?");
if ((closing.match(/[.!?]/g) ?? []).length !== 1) {
  reject("the line must be exactly one sentence");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, sentence, "utf8");
console.log(sentence);
console.log(`OK: ${sentence.length}/${MAX_CHARS} characters, one sentence, saved to ${outPath}.`);
