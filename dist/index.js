#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      name: "linguai",
      version: "1.0.1",
      description: "A blazingly fast, AI-powered translation tool for your JSON locale files",
      author: "Ludvig Lundh",
      license: "MIT",
      private: false,
      bin: {
        linguai: "./dist/index.js"
      },
      main: "dist/index.js",
      type: "module",
      files: [
        "dist",
        "README.md",
        "LICENSE"
      ],
      scripts: {
        dev: "tsup src/index.ts --format esm --watch --clean",
        start: "node dist/index.js",
        build: "tsup src/index.ts --format esm --dts --clean",
        lint: "biome check .",
        format: "biome format --write .",
        typecheck: "tsc --noEmit",
        test: "bun test src",
        clean: "rm -rf node_modules",
        prepublishOnly: "npm run build"
      },
      keywords: [
        "translation",
        "i18n",
        "localization",
        "ai",
        "gpt",
        "openai",
        "cli"
      ],
      repository: {
        type: "git",
        url: "git+https://github.com/ludviglundh/linguai.git"
      },
      bugs: {
        url: "https://github.com/ludviglundh/linguai/issues"
      },
      homepage: "https://github.com/ludviglundh/linguai#readme",
      engines: {
        node: ">=18.0.0"
      },
      dependencies: {
        "@ai-sdk/openai": "^1.0.8",
        "@biomejs/biome": "^1.9.4",
        "@clack/prompts": "^0.8.2",
        ai: "^4.0.14",
        chalk: "^5.3.0",
        dedent: "^1.5.3",
        dotenv: "^16.4.7",
        zod: "^3.24.1"
      },
      devDependencies: {
        "@types/node": "^22.10.2",
        tsup: "^8.3.5",
        typescript: "^5.7.2"
      }
    };
  }
});

// src/index.ts
import { select as select3 } from "@clack/prompts";
import dotenv2 from "dotenv";
import chalk3 from "chalk";

// src/lib/init.ts
import fs from "node:fs/promises";
import path from "node:path";
import { intro, outro, select, text } from "@clack/prompts";
async function init() {
  intro("Setup i18n configuration");
  const sourceLanguage = await select({
    message: "Select the source language",
    options: [
      { value: "en", label: "English" },
      { value: "se", label: "Swedish" },
      { value: "no", label: "Norwegian" },
      { value: "da", label: "Danish" },
      { value: "fi", label: "Finnish" },
      { value: "is", label: "Icelandic" },
      { value: "de", label: "German" },
      { value: "nl", label: "Dutch" },
      { value: "pl", label: "Polish" },
      { value: "pt", label: "Portuguese" }
    ]
  });
  const targetLanguages = await text({
    message: "Enter the target languages (comma separated)",
    placeholder: "se,no,da,fi,is,de,nl,pl,pt",
    validate(value) {
      if (!value) {
        return "Target languages are required";
      }
      const codes = value.split(",").map((code) => code.trim().toLowerCase());
      const validCodes = /* @__PURE__ */ new Set([
        "se",
        "no",
        "da",
        "fi",
        "is",
        "de",
        "nl",
        "pl",
        "pt"
      ]);
      if (codes.some((code) => !validCodes.has(code))) {
        return "Invalid target language code";
      }
      return;
    }
  });
  const filesDir = await text({
    message: "Enter the directory to scan for files",
    placeholder: "src/locales",
    defaultValue: "src/locales",
    validate: () => void 0
  });
  const fileFormat = await select({
    message: "Select the file format",
    options: [
      { value: "ts", label: "Typescript (.ts)" },
      { value: "json", label: "JSON (.json)" },
      { value: "yaml", label: "YAML (.yaml)" },
      { value: "toml", label: "TOML (.toml)" }
    ]
  });
  const model = await select({
    message: "Select openAI model",
    options: [
      { value: "gpt-4", label: "GPT-4 (Default)" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o mini" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
    ],
    initialValue: "gpt-4"
  });
  const config = {
    version: require_package().version,
    locale: {
      source: sourceLanguage,
      targets: String(targetLanguages).split(",").map((l) => l.trim().toLowerCase())
    },
    files: {
      [fileFormat]: {
        include: [`${String(filesDir)}/[locale].${String(fileFormat)}`]
      }
    },
    openai: {
      model
    }
  };
  try {
    await fs.mkdir(path.join(process.cwd(), String(filesDir)), {
      recursive: true
    });
    const sourceFile = path.join(
      process.cwd(),
      `${String(filesDir)}/${String(sourceLanguage)}.${String(fileFormat)}`
    );
    if (!await fs.access(sourceFile).then(() => true).catch(() => false)) {
      await fs.writeFile(sourceFile, "", "utf-8");
    }
    const targetLangs = typeof targetLanguages === "string" ? targetLanguages.split(",") : [];
    for (const lang of targetLangs.map((l) => l.trim().toLowerCase())) {
      const targetFile = path.join(
        process.cwd(),
        `${String(filesDir)}/${lang}.${String(fileFormat)}`
      );
      if (!await fs.access(targetFile).then(() => true).catch(() => false)) {
        await fs.writeFile(targetFile, "", "utf-8");
      }
    }
    await fs.writeFile(
      path.join(process.cwd(), "linguai.json"),
      JSON.stringify(config, null, 2)
    );
    outro("linguai configuration created successfully");
  } catch (error) {
    outro("Failed to create configuration");
    process.exit(1);
  }
  console.log(sourceLanguage, targetLanguages, filesDir, fileFormat, model);
}

// src/lib/translate.ts
import fs3 from "node:fs/promises";
import path3 from "node:path";
import { intro as intro2, outro as outro3, spinner, confirm as confirm2, select as select2 } from "@clack/prompts";
import chalk2 from "chalk";
import { createOpenAI } from "@ai-sdk/openai";
import dedent from "dedent";
import { generateText } from "ai";

// src/lib/getApiKey.ts
import { confirm, outro as outro2, text as text2 } from "@clack/prompts";
import chalk from "chalk";
import fs2 from "fs/promises";
import path2 from "path";
import dotenv from "dotenv";
async function loadEnvFile(filename) {
  try {
    const envPath = path2.join(process.cwd(), filename);
    await fs2.access(envPath);
    dotenv.config({ path: envPath });
  } catch (error) {
  }
}
async function getApiKey(name, key) {
  await loadEnvFile(".env");
  await loadEnvFile(".env.local");
  const envKey = process.env[key];
  if (envKey) {
    return envKey;
  }
  let apiKey;
  do {
    apiKey = await text2({
      message: `Enter your ${name} API key`,
      placeholder: "sk-...",
      validate: (value) => value.length > 0 ? void 0 : `Please provide a valid ${key}.`
    });
  } while (typeof apiKey === "undefined");
  if (typeof apiKey === "symbol") {
    outro2(chalk.gray("Bye!"));
    process.exit(1);
  }
  const save = await confirm({
    message: `Save ${key} to environment variables?`
  });
  if (save) {
    try {
      const envPath = path2.join(process.cwd(), ".env.local");
      await fs2.appendFile(envPath, `
${key}=${apiKey}
`);
      try {
        const gitignorePath = path2.join(process.cwd(), ".gitignore");
        let gitignore = "";
        try {
          gitignore = await fs2.readFile(gitignorePath, "utf-8");
        } catch {
        }
        if (!gitignore.includes(".env.local")) {
          await fs2.appendFile(gitignorePath, "\n.env.local\n");
        }
      } catch (error) {
        console.error(chalk.yellow("\u26A0\uFE0F Note: Could not update .gitignore"));
      }
      dotenv.config({ path: envPath });
    } catch (error) {
      console.error(chalk.red("Failed to save API key to .env.local"));
      console.error(error);
    }
  }
  return apiKey;
}

// src/prompt.ts
var prompt = `
Translation Guidelines:
Core Requirements:
- Keep the exact file structure and formatting intact
- Only translate text inside quotes, leaving all other elements untouched
- Preserve all object keys, syntax, and punctuation exactly as they are
- Maintain consistent spacing and casing throughout

Quality Standards:
- Ensure translations are natural and culturally appropriate
- Adapt idioms and expressions to make sense in the target language
- Maintain consistent terminology throughout the translation
- Consider context and user interface requirements

Important Dont's:
- Don't modify any code elements or structure
- Don't add explanatory comments or notes
- Don't change variable names or technical terms
- Don't alter special characters or formatting markers
`;

// src/lib/translate.ts
var CONFIG_FILE = "linguai.json";
async function translate(targetLocale2) {
  intro2(chalk2.bold.cyan("\u{1F30D} Time to make your app speak new languages!"));
  const config = await loadConfig();
  const { source, targets } = config.locale;
  const locales = validateAndGetLocales(targetLocale2, targets);
  const openai = createOpenAI({
    apiKey: await getApiKey("OpenAI", "OPENAI_API_KEY")
  });
  const s = spinner();
  let successCount = 0;
  const totalFiles = calculateTotalFiles(config, locales);
  const overrideAll = false;
  const skipAll = false;
  for (const locale of locales) {
    s.start(`\u{1F504} Cooking up ${locale} translations...`);
    for (const [format, { include }] of Object.entries(config.files)) {
      for (const pattern of include) {
        try {
          const result = await processFile(
            pattern,
            source,
            locale,
            format,
            config,
            openai,
            { overrideAll, skipAll }
          );
          if (result.translated) {
            successCount++;
            s.stop(`\u2728 Progress: ${successCount}/${totalFiles} files translated`);
            s.start(`\u{1F504} Continuing translations...`);
          } else if (result.skipped) {
            s.stop(chalk2.yellow(`\u23ED\uFE0F Skipped translation for ${pattern.replace("[locale]", locale)}`));
            s.start(`\u{1F504} Continuing translations...`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          s.stop(chalk2.red(`\u{1F6A8} Oops! Failed to translate ${pattern.replace("[locale]", locale)}`));
          console.error(chalk2.dim(errorMessage));
          s.start(`\u{1F504} Continuing with remaining translations...`);
        }
      }
    }
    s.stop(chalk2.green(`\u{1F389} Successfully cooked up ${locale} translations!`));
  }
  const message = successCount === totalFiles ? "\u{1F3C6} All translations are ready to serve!" : `\u{1F4CA} Translated ${successCount}/${totalFiles} files`;
  outro3(chalk2.bold.green(message));
}
function displayDiff(diff) {
  const keyHeader = chalk2.bold.cyan("\u{1F511} Key: ") + chalk2.cyan(diff.key);
  const maxLength = Math.max(diff.existing.length, diff.new.length) + 20;
  const separator = "\u2500".repeat(maxLength);
  console.log(`
${keyHeader}`);
  console.log(chalk2.dim(separator));
  console.log(chalk2.dim("Existing: ") + chalk2.red(diff.existing));
  console.log(chalk2.dim("New:      ") + chalk2.green(diff.new));
  console.log(chalk2.dim(separator));
}
function displayPreview(changes) {
  console.log(chalk2.bold.yellow("\n\u{1F4CB} Preview of Changes:"));
  if (changes.kept.length > 0) {
    console.log(chalk2.bold.blue("\n\u{1F512} Keeping Original Translations:"));
    changes.kept.forEach((diff) => {
      console.log(chalk2.dim(`  ${diff.key}: ${diff.existing}`));
    });
  }
  if (changes.updated.length > 0) {
    console.log(chalk2.bold.green("\n\u{1F504} Updating Translations:"));
    changes.updated.forEach((diff) => {
      console.log(chalk2.dim(`  ${diff.key}:`));
      console.log(chalk2.red(`    - ${diff.existing}`));
      console.log(chalk2.green(`    + ${diff.new}`));
    });
  }
}
async function loadConfig() {
  try {
    const configFile = await fs3.readFile(
      path3.join(process.cwd(), CONFIG_FILE),
      "utf-8"
    );
    return JSON.parse(configFile);
  } catch (error) {
    throw new Error("\u{1F605} Couldn't find linguai.json - run 'linguai init' to create one!");
  }
}
function validateAndGetLocales(targetLocale2, targets) {
  if (!targetLocale2) return targets;
  if (!targets.includes(targetLocale2)) {
    throw new Error(
      `\u{1F914} Target locale "${targetLocale2}" not in the menu! Available options: ${targets.join(", ")}`
    );
  }
  return [targetLocale2];
}
function calculateTotalFiles(config, locales) {
  return Object.values(config.files).reduce((acc, { include }) => acc + include.length, 0) * locales.length;
}
function findDuplicateTranslations(existing, newTranslations, prefix = "") {
  const duplicates = [];
  for (const [key, value] of Object.entries(newTranslations)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      duplicates.push(...findDuplicateTranslations(
        existing[key] || {},
        value,
        currentPath
      ));
    } else if (key in existing && existing[key] !== value) {
      duplicates.push({
        key: currentPath,
        existing: existing[key],
        new: value
      });
    }
  }
  return duplicates;
}
function setNestedValue(obj, path4, value) {
  const keys = path4.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}
function displayAllDiffs(duplicates) {
  console.log(chalk2.yellow(`
\u{1F4CB} All different translations found:`));
  console.log(chalk2.dim("\u2500".repeat(50)));
  duplicates.forEach((diff, index) => {
    const number = chalk2.blue(`[${index + 1}/${duplicates.length}]`);
    console.log(`${number} ${chalk2.bold.cyan(diff.key)}`);
    console.log(chalk2.dim("Existing: ") + chalk2.red(diff.existing));
    console.log(chalk2.dim("New:      ") + chalk2.green(diff.new));
    console.log(chalk2.dim("\u2500".repeat(50)));
  });
}
async function processFile(pattern, source, locale, format, config, openai, options) {
  const sourcePath = pattern.replace("[locale]", source);
  const targetPath = pattern.replace("[locale]", locale);
  const existingContent = await checkExistingTranslation(targetPath);
  const sourceContent = await ensureSourceFile(sourcePath);
  if (!sourceContent.trim()) {
    console.log(chalk2.yellow(`\u26A0\uFE0F Source file ${sourcePath} is empty, skipping...`));
    return { translated: false };
  }
  if (existingContent && !options.overrideAll && !options.skipAll) {
    try {
      const existingTranslations = JSON.parse(existingContent);
      const sourceTranslations = JSON.parse(sourceContent);
      const translatedSourceContent = await translateContent(
        sourceContent,
        source,
        locale,
        format,
        config,
        openai
      );
      let newTranslations;
      try {
        newTranslations = JSON.parse(translatedSourceContent);
      } catch (error) {
        console.log(chalk2.red("\u26A0\uFE0F Failed to parse translated content, skipping duplicate check."));
        return { translated: false };
      }
      const duplicates = findDuplicateTranslations(existingTranslations, newTranslations);
      if (duplicates.length > 0) {
        console.log(chalk2.yellow(`
\u{1F4CB} Found ${duplicates.length} different translations in ${path3.basename(targetPath)}:`));
        displayAllDiffs(duplicates);
        const globalAction = await select2({
          message: chalk2.yellow(`
Choose how to handle all ${duplicates.length} translations:`),
          options: [
            {
              value: "individual",
              label: `\u{1F50D} Choose for each translation individually (${duplicates.length} items)`
            },
            {
              value: "keepAll",
              label: `\u{1F4BE} Keep all existing translations (${duplicates.length} items)`
            },
            {
              value: "updateAll",
              label: `\u{1F504} Use all new translations (${duplicates.length} items)`
            }
          ]
        });
        const mergedTranslations = { ...existingTranslations };
        const changes = { kept: [], updated: [] };
        if (globalAction === "keepAll") {
          changes.kept.push(...duplicates);
        } else if (globalAction === "updateAll") {
          for (const diff of duplicates) {
            setNestedValue(mergedTranslations, diff.key, diff.new);
            changes.updated.push({ ...diff, action: "update" });
          }
        } else {
          for (const diff of duplicates) {
            displayDiff(diff);
            const choice = await select2({
              message: chalk2.yellow(`Choose action for this translation:`),
              options: [
                { value: "keep", label: "\u{1F4BE} Keep existing translation" },
                { value: "update", label: "\u{1F504} Use new translation" }
              ]
            });
            if (choice === "update") {
              setNestedValue(mergedTranslations, diff.key, diff.new);
              changes.updated.push({ ...diff, action: "update" });
            } else {
              changes.kept.push({ ...diff, action: "keep" });
            }
          }
        }
        displayPreview(changes);
        const confirmChanges = await confirm2({
          message: chalk2.yellow("Apply these changes?"),
          initialValue: true
        });
        if (!confirmChanges) {
          console.log(chalk2.yellow("\u23ED\uFE0F Changes cancelled, keeping original translations."));
          return { translated: false, skipped: true };
        }
        await saveTranslation(targetPath, JSON.stringify(mergedTranslations, null, 2));
        return { translated: true };
      }
    } catch (error) {
      console.log(chalk2.yellow("\u26A0\uFE0F Could not parse JSON for duplicate checking, proceeding with normal translation."));
    }
  }
  const translatedContent = await translateContent(
    sourceContent,
    source,
    locale,
    format,
    config,
    openai
  );
  await saveTranslation(targetPath, translatedContent);
  return { translated: true };
}
async function checkExistingTranslation(targetPath) {
  try {
    const content = await fs3.readFile(path3.join(process.cwd(), targetPath), "utf-8");
    return content.trim() ? content : null;
  } catch (error) {
    return null;
  }
}
async function ensureSourceFile(sourcePath) {
  try {
    return await fs3.readFile(path3.join(process.cwd(), sourcePath), "utf-8");
  } catch (error) {
    const sourceDir = path3.dirname(path3.join(process.cwd(), sourcePath));
    await fs3.mkdir(sourceDir, { recursive: true });
    await fs3.writeFile(path3.join(process.cwd(), sourcePath), "", "utf-8");
    return "";
  }
}
async function translateContent(sourceContent, source, locale, format, config, openai) {
  const prompt2 = dedent`
		You are a professional translator working with ${format} files.
		
		Task: Translate the content below from ${source} to ${locale}.
		
		${prompt}
		${config.instructions ?? ""}

		Source content:
		${sourceContent}

		Return only the translated content with identical formatting and structure.
	`;
  const { text: text3 } = await generateText({
    model: openai(config.openai.model),
    prompt: prompt2
  });
  return text3;
}
async function saveTranslation(targetPath, content) {
  const targetDir = path3.dirname(path3.join(process.cwd(), targetPath));
  await fs3.mkdir(targetDir, { recursive: true });
  await fs3.writeFile(path3.join(process.cwd(), targetPath), content, "utf-8");
}

// src/index.ts
dotenv2.config();
console.log(chalk3.bold.cyan("\u{1F35D} Welcome to linguai - Let's cook up some translations!\n"));
var command = process.argv[2] || await select3({
  message: "What's cooking? Choose your next move:",
  options: [
    { value: "init", label: "\u{1F680} Create a fresh linguai recipe (new config)" },
    { value: "translate", label: "\u{1F30D} Cook up some translations" },
    { value: "instructions", label: "\u{1F4DD} Add your secret sauce (custom instructions)" }
  ]
});
var targetLocale = process.argv[3];
try {
  switch (command) {
    case "init":
      await init();
      break;
    case "translate":
      await translate(targetLocale);
      break;
    case "instructions":
      console.log(chalk3.yellow("\u{1F527} Custom instructions feature coming soon to spice things up!"));
      break;
    default:
      console.log(chalk3.red("\u274C Oops! That's not on the menu. Try one of the options above."));
  }
} catch (error) {
  console.error(chalk3.red(`
\u274C Whoops! Something went wrong: ${error}`));
  process.exit(1);
}
