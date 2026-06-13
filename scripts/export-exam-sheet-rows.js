const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const examRoot = path.join(root, "assets", "data", "exams");
const catalogPath = path.join(examRoot, "catalog.json");
const outputPath = path.join(root, "outputs", "exam_tests_rows.tsv");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function cell(value) {
  const text = String(value ?? "");
  return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

const headers = [
  "id",
  "part",
  "title",
  "description",
  "difficulty",
  "question_count",
  "duration_minutes",
  "tags",
  "published",
  "version",
  "data_json",
  "updated_at"
];

const catalog = readJson(catalogPath);
const rows = [headers];

(catalog.tests || []).forEach((entry) => {
  const test = readJson(path.join(examRoot, entry.dataFile));
  rows.push([
    entry.id,
    entry.part,
    entry.title,
    entry.description,
    entry.difficulty,
    test.questions.length,
    entry.durationMinutes,
    JSON.stringify(entry.tags || []),
    String(entry.published !== false),
    test.version || 1,
    JSON.stringify(test),
    new Date().toISOString()
  ]);
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${rows.map((row) => row.map(cell).join("\t")).join("\n")}\n`, "utf8");
console.log(`Exported ${rows.length - 1} exam row(s) to ${path.relative(root, outputPath)}`);
