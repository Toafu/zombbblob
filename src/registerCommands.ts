require('dotenv').config()

import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { ConfigHandler } from './config';
const { CLIENT_ID, SERVER_ID, PREVIOUS_COMMANDS_PATH } = ConfigHandler.getInstance().getConfig();

export const registerCommands = async function() {
    if (!process.env.TOKEN) {
        console.error("No TOKEN in ENV!");
        process.exit(1);
    }

    const commandsDirectoryPath = path.join(__dirname, "commands/");
    const commandDatums = await Promise.all(fs.readdirSync(commandsDirectoryPath).map(async commandFileName => {
        const { command } = await import(
            path.join(commandsDirectoryPath, commandFileName)
        );
        return command.data.toJSON();
    }));

    const currentCommandsHash = crypto
                            .createHash('sha256')
                            .update(
                                JSON.stringify(
                                    commandDatums.sort(
                                        (dataA, dataB) => dataA.name.localeCompare(dataB.name)
                                    )
                                )
                            )
                            .digest("hex");

    const previousCommandsHash = fs.existsSync(PREVIOUS_COMMANDS_PATH) ? fs.readFileSync(PREVIOUS_COMMANDS_PATH).toString() : null;
    
    if (currentCommandsHash === previousCommandsHash) {
        console.log("Command registration data is up-to-date!");
        return;
    }

    const restClient = new REST().setToken(process.env.TOKEN);

    console.log("Clearing old commands...");
    await restClient.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), 
        { body: [] }
    );
    
    console.log("Inserting new commands...");
    await restClient.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID),
        { body: commandDatums }
    );

    fs.writeFileSync(PREVIOUS_COMMANDS_PATH, currentCommandsHash);
}