#!/usr/bin/env node
import { select } from "@clack/prompts";
import dotenv from "dotenv";
import chalk from "chalk";
import { init } from "./lib/init.js";
import { translate } from "./lib/translate.js";
dotenv.config();
console.log(chalk.bold.cyan("🍝 Welcome to linguai - Let's cook up some translations!\n"));
const command = process.argv[2] || await select({
    message: "What's cooking? Choose your next move:",
    options: [
        { value: "init", label: "🚀 Create a fresh linguai recipe (new config)" },
        { value: "translate", label: "🌍 Cook up some translations" },
        { value: "instructions", label: "📝 Add your secret sauce (custom instructions)" },
    ],
});
const targetLocale = process.argv[3];
try {
    switch (command) {
        case "init":
            await init();
            break;
        case "translate":
            await translate(targetLocale);
            break;
        case "instructions":
            console.log(chalk.yellow("🔧 Custom instructions feature coming soon to spice things up!"));
            break;
        default:
            console.log(chalk.red("❌ Oops! That's not on the menu. Try one of the options above."));
    }
}
catch (error) {
    console.error(chalk.red(`\n❌ Whoops! Something went wrong: ${error}`));
    process.exit(1);
}
//# sourceMappingURL=index.js.map