/*
    RCO3 Installer written in NodeJS by Kaede <3
 */

import chalk from 'chalk';
import centerText from 'center-text';
import makePrompt from 'prompt-sync';
const prompt = makePrompt({ sigint: true });

const authors = [
    "Kaede",
    "L8X",
    "Expo"
];

let authorsStr = "";
for (const author of authors) {
    if (author === authors[authors.length-1]) {
        authorsStr += chalk.redBright("and ") + chalk.greenBright(author)
        break
    }
    authorsStr += chalk.greenBright(author) + ", "
}

const commands = [
    {
        "name":"Install",
        "long":"install",
        "short":"i",
        "description":"Installs RCO!"
    },
    {
        "name":"Uninstall",
        "long":"uninstall",
        "short":"u",
        "description":"Uninstalls RCO :("
    }
];

function getMenu() {
    let menu = centerText(chalk.redBright("R") + chalk.yellowBright("C" + chalk.magentaBright("O"))) + "\n" +
        centerText(chalk.cyan("Made with ") + chalk.red("<3") + chalk.cyan(" by ") + authorsStr) + "\n\n" +
        chalk.gray("Commands: ") + "\n";
    for (let i=0; i<commands.length; i++) {
        menu += "\t" + chalk.whiteBright(commands[i].name + " - " + commands[i].long + "|" + commands[i].short + " - " + commands[i].description) + "\n";
    }
    return menu;
}

const menu = getMenu();

function main() {
    console.clear();
    console.log(menu);

    const choice = prompt("Choice: ").toLowerCase();

    if (choice === "i" || choice === "install") { // Installer
        //todo
    }

    if (choice === "u" || choice === "uninstall") { // Uninstaller
        //todo
    }
}

main();

console.log("\nProgram is exiting! Bye <3");
