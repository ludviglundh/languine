import fs from "node:fs/promises";
import path from "node:path";
import { intro, outro, spinner, confirm, select } from "@clack/prompts";
import chalk from "chalk";
import { createOpenAI } from "@ai-sdk/openai";
import dedent from "dedent";
import { generateText } from "ai";
import { getApiKey } from "./getApiKey.js";
import { prompt as defaultPrompt } from "../prompt.js";
const CONFIG_FILE = "linguai.json";
export async function translate(targetLocale) {
    intro(chalk.bold.cyan("🌍 Time to make your app speak new languages!"));
    const config = await loadConfig();
    const { source, targets } = config.locale;
    const locales = validateAndGetLocales(targetLocale, targets);
    const openai = createOpenAI({
        apiKey: await getApiKey("OpenAI", "OPENAI_API_KEY"),
    });
    const s = spinner();
    let successCount = 0;
    const totalFiles = calculateTotalFiles(config, locales);
    const overrideAll = false;
    const skipAll = false;
    for (const locale of locales) {
        s.start(`🔄 Cooking up ${locale} translations...`);
        for (const [format, { include }] of Object.entries(config.files)) {
            for (const pattern of include) {
                try {
                    const result = await processFile(pattern, source, locale, format, config, openai, { overrideAll, skipAll });
                    if (result.translated) {
                        successCount++;
                        s.stop(`✨ Progress: ${successCount}/${totalFiles} files translated`);
                        s.start(`🔄 Continuing translations...`);
                    }
                    else if (result.skipped) {
                        s.stop(chalk.yellow(`⏭️ Skipped translation for ${pattern.replace("[locale]", locale)}`));
                        s.start(`🔄 Continuing translations...`);
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    s.stop(chalk.red(`🚨 Oops! Failed to translate ${pattern.replace("[locale]", locale)}`));
                    console.error(chalk.dim(errorMessage));
                    s.start(`🔄 Continuing with remaining translations...`);
                }
            }
        }
        s.stop(chalk.green(`🎉 Successfully cooked up ${locale} translations!`));
    }
    const message = successCount === totalFiles
        ? "🏆 All translations are ready to serve!"
        : `📊 Translated ${successCount}/${totalFiles} files`;
    outro(chalk.bold.green(message));
}
function displayDiff(diff) {
    const keyHeader = chalk.bold.cyan('🔑 Key: ') + chalk.cyan(diff.key);
    const maxLength = Math.max(diff.existing.length, diff.new.length) + 20;
    const separator = '─'.repeat(maxLength);
    console.log(`\n${keyHeader}`);
    console.log(chalk.dim(separator));
    console.log(chalk.dim('Existing: ') + chalk.red(diff.existing));
    console.log(chalk.dim('New:      ') + chalk.green(diff.new));
    console.log(chalk.dim(separator));
}
function displayPreview(changes) {
    console.log(chalk.bold.yellow('\n📋 Preview of Changes:'));
    if (changes.kept.length > 0) {
        console.log(chalk.bold.blue('\n🔒 Keeping Original Translations:'));
        changes.kept.forEach(diff => {
            console.log(chalk.dim(`  ${diff.key}: ${diff.existing}`));
        });
    }
    if (changes.updated.length > 0) {
        console.log(chalk.bold.green('\n🔄 Updating Translations:'));
        changes.updated.forEach(diff => {
            console.log(chalk.dim(`  ${diff.key}:`));
            console.log(chalk.red(`    - ${diff.existing}`));
            console.log(chalk.green(`    + ${diff.new}`));
        });
    }
}
async function loadConfig() {
    try {
        const configFile = await fs.readFile(path.join(process.cwd(), CONFIG_FILE), "utf-8");
        return JSON.parse(configFile);
    }
    catch (error) {
        throw new Error("😅 Couldn't find linguai.json - run 'linguai init' to create one!");
    }
}
function validateAndGetLocales(targetLocale, targets) {
    if (!targetLocale)
        return targets;
    if (!targets.includes(targetLocale)) {
        throw new Error(`🤔 Target locale "${targetLocale}" not in the menu! Available options: ${targets.join(", ")}`);
    }
    return [targetLocale];
}
function calculateTotalFiles(config, locales) {
    return Object.values(config.files)
        .reduce((acc, { include }) => acc + include.length, 0) * locales.length;
}
function findDuplicateTranslations(existing, newTranslations, prefix = '') {
    const duplicates = [];
    for (const [key, value] of Object.entries(newTranslations)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            // Recursively check nested objects
            duplicates.push(...findDuplicateTranslations(existing[key] || {}, value, currentPath));
        }
        else if (key in existing && existing[key] !== value) {
            duplicates.push({
                key: currentPath,
                existing: existing[key],
                new: value
            });
        }
    }
    return duplicates;
}
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
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
    console.log(chalk.yellow(`\n📋 All different translations found:`));
    console.log(chalk.dim('─'.repeat(50)));
    duplicates.forEach((diff, index) => {
        const number = chalk.blue(`[${index + 1}/${duplicates.length}]`);
        console.log(`${number} ${chalk.bold.cyan(diff.key)}`);
        console.log(chalk.dim('Existing: ') + chalk.red(diff.existing));
        console.log(chalk.dim('New:      ') + chalk.green(diff.new));
        console.log(chalk.dim('─'.repeat(50)));
    });
}
async function processFile(pattern, source, locale, format, config, openai, options) {
    const sourcePath = pattern.replace("[locale]", source);
    const targetPath = pattern.replace("[locale]", locale);
    const existingContent = await checkExistingTranslation(targetPath);
    const sourceContent = await ensureSourceFile(sourcePath);
    if (!sourceContent.trim()) {
        console.log(chalk.yellow(`⚠️ Source file ${sourcePath} is empty, skipping...`));
        return { translated: false };
    }
    if (existingContent && !options.overrideAll && !options.skipAll) {
        try {
            const existingTranslations = JSON.parse(existingContent);
            const sourceTranslations = JSON.parse(sourceContent);
            // First, translate the source content to the target language
            const translatedSourceContent = await translateContent(sourceContent, source, locale, format, config, openai);
            let newTranslations;
            try {
                newTranslations = JSON.parse(translatedSourceContent);
            }
            catch (error) {
                console.log(chalk.red("⚠️ Failed to parse translated content, skipping duplicate check."));
                return { translated: false };
            }
            const duplicates = findDuplicateTranslations(existingTranslations, newTranslations);
            if (duplicates.length > 0) {
                console.log(chalk.yellow(`\n📋 Found ${duplicates.length} different translations in ${path.basename(targetPath)}:`));
                // Display all differences first
                displayAllDiffs(duplicates);
                // Ask for global action
                const globalAction = await select({
                    message: chalk.yellow(`\nChoose how to handle all ${duplicates.length} translations:`),
                    options: [
                        {
                            value: 'individual',
                            label: `🔍 Choose for each translation individually (${duplicates.length} items)`
                        },
                        {
                            value: 'keepAll',
                            label: `💾 Keep all existing translations (${duplicates.length} items)`
                        },
                        {
                            value: 'updateAll',
                            label: `🔄 Use all new translations (${duplicates.length} items)`
                        },
                    ],
                });
                // Create a merged translation object
                const mergedTranslations = { ...existingTranslations };
                const changes = { kept: [], updated: [] };
                if (globalAction === 'keepAll') {
                    // Keep all existing translations
                    changes.kept.push(...duplicates);
                }
                else if (globalAction === 'updateAll') {
                    // Update all translations
                    for (const diff of duplicates) {
                        setNestedValue(mergedTranslations, diff.key, diff.new);
                        changes.updated.push({ ...diff, action: 'update' });
                    }
                }
                else {
                    // Process each duplicate individually
                    for (const diff of duplicates) {
                        displayDiff(diff);
                        const choice = await select({
                            message: chalk.yellow(`Choose action for this translation:`),
                            options: [
                                { value: 'keep', label: '💾 Keep existing translation' },
                                { value: 'update', label: '🔄 Use new translation' },
                            ],
                        });
                        if (choice === 'update') {
                            setNestedValue(mergedTranslations, diff.key, diff.new);
                            changes.updated.push({ ...diff, action: 'update' });
                        }
                        else {
                            changes.kept.push({ ...diff, action: 'keep' });
                        }
                    }
                }
                // Show preview of all changes
                displayPreview(changes);
                const confirmChanges = await confirm({
                    message: chalk.yellow('Apply these changes?'),
                    initialValue: true,
                });
                if (!confirmChanges) {
                    console.log(chalk.yellow('⏭️ Changes cancelled, keeping original translations.'));
                    return { translated: false, skipped: true };
                }
                // Save the merged translations
                await saveTranslation(targetPath, JSON.stringify(mergedTranslations, null, 2));
                return { translated: true };
            }
        }
        catch (error) {
            console.log(chalk.yellow("⚠️ Could not parse JSON for duplicate checking, proceeding with normal translation."));
        }
    }
    const translatedContent = await translateContent(sourceContent, source, locale, format, config, openai);
    await saveTranslation(targetPath, translatedContent);
    return { translated: true };
}
async function checkExistingTranslation(targetPath) {
    try {
        const content = await fs.readFile(path.join(process.cwd(), targetPath), "utf-8");
        return content.trim() ? content : null;
    }
    catch (error) {
        return null;
    }
}
async function ensureSourceFile(sourcePath) {
    try {
        return await fs.readFile(path.join(process.cwd(), sourcePath), "utf-8");
    }
    catch (error) {
        const sourceDir = path.dirname(path.join(process.cwd(), sourcePath));
        await fs.mkdir(sourceDir, { recursive: true });
        await fs.writeFile(path.join(process.cwd(), sourcePath), "", "utf-8");
        return "";
    }
}
async function translateContent(sourceContent, source, locale, format, config, openai) {
    const prompt = dedent `
		You are a professional translator working with ${format} files.
		
		Task: Translate the content below from ${source} to ${locale}.
		
		${defaultPrompt}
		${config.instructions ?? ""}

		Source content:
		${sourceContent}

		Return only the translated content with identical formatting and structure.
	`;
    const { text } = await generateText({
        model: openai(config.openai.model),
        prompt,
    });
    return text;
}
async function saveTranslation(targetPath, content) {
    const targetDir = path.dirname(path.join(process.cwd(), targetPath));
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(process.cwd(), targetPath), content, "utf-8");
}
//# sourceMappingURL=translate.js.map