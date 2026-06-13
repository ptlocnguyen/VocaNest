const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const examRoot = path.join(root, "assets", "data", "exams");
const catalogPath = path.join(examRoot, "catalog.json");
const grammarPath = path.join(root, "assets", "js", "grammar.js");
const allowedDifficulties = new Set(["basic", "intermediate", "advanced"]);
const errors = [];

const grammarIds = new Set(
  [...fs.readFileSync(grammarPath, "utf8").matchAll(/id:\s*["']([^"']+)["']/g)].map((match) => match[1])
);

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, filePath)}: ${error.message}`);
    return null;
  }
}

function validateQuestion(question, testId, index, seenIds) {
  const label = `${testId} question ${index + 1}`;
  const requiredText = ["id", "topic", "grammarId", "difficulty", "sentence", "explanation", "tip"];

  requiredText.forEach((key) => {
    if (typeof question[key] !== "string" || !question[key].trim()) {
      errors.push(`${label}: "${key}" must be a non-empty string`);
    }
  });

  if (seenIds.has(question.id)) errors.push(`${label}: duplicate question id "${question.id}"`);
  seenIds.add(question.id);

  if (!allowedDifficulties.has(question.difficulty)) {
    errors.push(`${label}: invalid difficulty "${question.difficulty}"`);
  }
  if (question.grammarId && !grammarIds.has(question.grammarId)) {
    errors.push(`${label}: unknown grammarId "${question.grammarId}"`);
  }
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    errors.push(`${label}: options must contain exactly four values`);
  } else if (question.options.some((option) => typeof option !== "string" || !option.trim())) {
    errors.push(`${label}: every option must be a non-empty string`);
  }
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
    errors.push(`${label}: answer must be an integer from 0 to 3`);
  }
}

const catalog = readJson(catalogPath);
if (!catalog || !Array.isArray(catalog.tests)) {
  errors.push("catalog.json: tests must be an array");
} else {
  const seenTests = new Set();
  const seenQuestions = new Set();

  catalog.tests.forEach((entry, index) => {
    const label = `catalog test ${index + 1}`;
    if (!entry.id || seenTests.has(entry.id)) errors.push(`${label}: missing or duplicate id`);
    seenTests.add(entry.id);
    if (!entry.dataFile) {
      errors.push(`${label}: dataFile is required`);
      return;
    }

    const testPath = path.resolve(examRoot, entry.dataFile);
    const relativeTestPath = path.relative(examRoot, testPath);
    if (relativeTestPath.startsWith("..") || path.isAbsolute(relativeTestPath) || !fs.existsSync(testPath)) {
      errors.push(`${label}: data file not found "${entry.dataFile}"`);
      return;
    }

    const test = readJson(testPath);
    if (!test) return;
    if (test.id !== entry.id) errors.push(`${entry.id}: catalog and file IDs do not match`);
    if (test.part !== 5) errors.push(`${entry.id}: only Part 5 is currently supported`);
    if (!allowedDifficulties.has(test.difficulty)) errors.push(`${entry.id}: invalid difficulty`);
    if (!Array.isArray(test.questions) || !test.questions.length) {
      errors.push(`${entry.id}: questions must be a non-empty array`);
      return;
    }
    if (entry.questionCount !== test.questions.length) {
      errors.push(`${entry.id}: catalog questionCount does not match the data file`);
    }
    test.questions.forEach((question, questionIndex) => {
      validateQuestion(question, test.id, questionIndex, seenQuestions);
    });
  });
}

if (errors.length) {
  console.error(`Exam validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Exam validation passed: ${catalog.tests.length} test(s).`);
