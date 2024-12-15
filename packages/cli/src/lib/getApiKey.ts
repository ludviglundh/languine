import fs from "node:fs/promises";
import path from "node:path";
import { confirm, outro, text } from "@clack/prompts";
import chalk from "chalk";
import dotenv from "dotenv";

async function loadEnvFile(filename: string): Promise<void> {
	try {
		const envPath = path.join(process.cwd(), filename);
		await fs.access(envPath);
		dotenv.config({ path: envPath });
	} catch (error) {
		// File doesn't exist or isn't accessible, skip it
	}
}

export async function getApiKey(name: string, key: string): Promise<string> {
	// Load both .env and .env.local files
	await loadEnvFile(".env");
	await loadEnvFile(".env.local");

	// Check if key exists in environment variables
	const envKey = process.env[key];
	if (envKey) {
		return envKey;
	}

	// If not found, prompt for the key
	let apiKey: string | symbol;
	do {
		apiKey = await text({
			message: `Enter your ${name} API key`,
			placeholder: "sk-...",
			validate: (value) =>
				value.length > 0 ? undefined : `Please provide a valid ${key}.`,
		});
	} while (typeof apiKey === "undefined");

	if (typeof apiKey === "symbol") {
		outro(chalk.gray("Bye!"));
		process.exit(1);
	}

	const save = await confirm({
		message: `Save ${key} to environment variables?`,
	});

	if (save) {
		try {
			// Append to .env.local
			const envPath = path.join(process.cwd(), ".env.local");
			await fs.appendFile(envPath, `\n${key}=${apiKey}\n`);

			// Update gitignore if needed
			try {
				const gitignorePath = path.join(process.cwd(), ".gitignore");
				let gitignore = "";

				try {
					gitignore = await fs.readFile(gitignorePath, "utf-8");
				} catch {
					// .gitignore doesn't exist yet
				}

				if (!gitignore.includes(".env.local")) {
					await fs.appendFile(gitignorePath, "\n.env.local\n");
				}
			} catch (error) {
				console.error(chalk.yellow("⚠️ Note: Could not update .gitignore"));
			}

			// Reload environment variables
			dotenv.config({ path: envPath });
		} catch (error) {
			console.error(chalk.red("Failed to save API key to .env.local"));
			console.error(error);
		}
	}

	return apiKey as string;
}
