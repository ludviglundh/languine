import fs from "node:fs/promises";
import path from "node:path";
import { intro, outro, select, text } from "@clack/prompts";

export async function init() {
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
			{ value: "pt", label: "Portuguese" },
		],
	});

	const targetLanguages = await text({
		message: "Enter the target languages (comma separated)",
		placeholder: "se,no,da,fi,is,de,nl,pl,pt",
		validate(value) {
			if (!value) {
				return "Target languages are required";
			}

			const codes = value.split(",").map((code) => code.trim().toLowerCase());

			const validCodes = new Set([
				"se",
				"no",
				"da",
				"fi",
				"is",
				"de",
				"nl",
				"pl",
				"pt",
			]);

			if (codes.some((code) => !validCodes.has(code))) {
				return "Invalid target language code";
			}

			return;
		},
	});

	const filesDir = await text({
		message: "Enter the directory to scan for files",
		placeholder: "src/locales",
		defaultValue: "src/locales",
		validate: () => undefined,
	});

	const fileFormat = await select({
		message: "Select the file format",
		options: [
			{ value: "ts", label: "Typescript (.ts)" },
			{ value: "json", label: "JSON (.json)" },
			{ value: "yaml", label: "YAML (.yaml)" },
			{ value: "toml", label: "TOML (.toml)" },
		],
	});

	const model = await select({
		message: "Select openAI model",
		options: [
			{ value: "gpt-4", label: "GPT-4 (Default)" },
			{ value: "gpt-4-turbo", label: "GPT-4 Turbo" },
			{ value: "gpt-4o", label: "GPT-4o" },
			{ value: "gpt-4o-mini", label: "GPT-4o mini" },
			{ value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
		],
		initialValue: "gpt-4",
	});

	const config = {
		version: require("../../package.json").version,
		locale: {
			source: sourceLanguage,
			targets: String(targetLanguages)
				.split(",")
				.map((l) => l.trim().toLowerCase()),
		},
		files: {
			[fileFormat]: {
				include: [`${String(filesDir)}/[locale].${String(fileFormat)}`],
			},
		},
		openai: {
			model,
		},
	};

	try {
		await fs.mkdir(path.join(process.cwd(), String(filesDir)), {
			recursive: true,
		});

		const sourceFile = path.join(
			process.cwd(),
			`${String(filesDir)}/${String(sourceLanguage)}.${String(fileFormat)}`,
		);

		if (
			!(await fs
				.access(sourceFile)
				.then(() => true)
				.catch(() => false))
		) {
			await fs.writeFile(sourceFile, "", "utf-8");
		}

		const targetLangs =
			typeof targetLanguages === "string" ? targetLanguages.split(",") : [];

		for (const lang of targetLangs.map((l) => l.trim().toLowerCase())) {
			const targetFile = path.join(
				process.cwd(),
				`${String(filesDir)}/${lang}.${String(fileFormat)}`,
			);

			if (
				!(await fs
					.access(targetFile)
					.then(() => true)
					.catch(() => false))
			) {
				await fs.writeFile(targetFile, "", "utf-8");
			}
		}

		await fs.writeFile(
			path.join(process.cwd(), "linguai.json"),
			JSON.stringify(config, null, 2),
		);

		outro("linguai configuration created successfully");
	} catch (error) {
		outro("Failed to create configuration");
		process.exit(1);
	}

	console.log(sourceLanguage, targetLanguages, filesDir, fileFormat, model);
}
