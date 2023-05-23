/*
    RCO3 written in NodeJS by Kaede <3
 */

import chalk from 'chalk';
import centerText from 'center-text';
import makePrompt from 'prompt-sync';

const prompt = makePrompt({ sigint: true });

// Literally the only reason there's two index files, if anyone knows a better way to check if OS is Windows before importing, please make a pull request
import {showConsole, hideConsole} from "node-hide-console-window";

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
        "name":"Toggle",
        "long":"toggle",
        "short":"t",
        "description":"Enables/Disables RCO"
    },
    {
        "name":"Settings",
        "long":"settings",
        "short":"s",
        "description":"Takes you to RCO's configuration settings!"
    },
    {
        "name":"Exit",
        "long":"exit",
        "short":"e",
        "description":"Closes RCO :("
    }
];

const settingsCommands = [
    {
        "name":"FPS Cap",
        "long":"fpscap",
        "short":"f",
        "description":"Allows you to change the FPS cap, or disable FPS unlocking entirely!"
    },
    {
        "name":"Back",
        "long":"back",
        "short":"b",
        "description":"Return to the main menu!"
    }
];

function getMenu(commands) {
    let menu = centerText(chalk.redBright("R") + chalk.yellowBright("C" + chalk.magentaBright("O"))) + "\n" +
        centerText(chalk.cyan("Made with ") + chalk.red("<3") + chalk.cyan(" by ") + authorsStr) + "\n\n" +
        chalk.gray("Commands: ") + "\n";
    for (let i=0; i<commands.length; i++) {
        menu += "\t" + chalk.whiteBright(commands[i].name + " - " + commands[i].long + "|" + commands[i].short + " - " + commands[i].description) + "\n";
    }
    return menu;
}

const menu = getMenu(commands);
const settingsMenu = getMenu(settingsCommands);

function main() {
    while (true) {
        console.clear();
        console.log(menu);

        const choice = prompt("Choice: ").toLowerCase();

        switch (choice) {
            case "t":
            case "toggle":
                //todo
                break;

            case "s":
            case "settings":
                console.clear();
                console.log(settingsMenu);
                const settingsChoice = prompt("Choice: ").toLowerCase();
                switch (settingsChoice) {
                    case "f":
                    case "fpscap":
                        //todo
                        break;
                }
                break;

            case "e":
            case "exit":
                process.exit();
                return;

            default:
                break;
        }
    }
}

main();

console.log("\nProgram is exiting, most likely due to some error! Bye <3");
