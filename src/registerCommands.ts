require('dotenv').config()

import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { CLIENT_ID, SERVER_ID } from './utils'
import { Command } from './command';

export const registerCommands = async function() {
    if (!process.env.TOKEN) {
        console.error("No TOKEN in ENV!");
        process.exit(1);
    }
    
    const restClient = new REST().setToken(process.env.TOKEN);

    const commandsDirectoryPath = path.join(__dirname, "commands/");
    const commandDatums = await Promise.all(fs.readdirSync(commandsDirectoryPath).map(async commandFileName => {
        const { command } = await import(
            path.join(commandsDirectoryPath, commandFileName)
        );
        return command.data.toJSON();
    }));

    await restClient.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), 
        { body: [] }
    );
    
    await restClient.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID),
        { body: commandDatums }
    );
}