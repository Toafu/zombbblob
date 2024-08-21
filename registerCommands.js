require('dotenv').config()

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { CLIENT_ID, SERVER_ID } = require('./utils')

const commandsPath = path.join(__dirname, "commands");
const commandFilePaths = fs.readdirSync(commandsPath).map(commandFileName => path.join(commandsPath, commandFileName));
const commandDatums = commandFilePaths.map(commandFilePath => require(commandFilePath).data.toJSON());

const restClient = new REST().setToken(process.env.TOKEN);

module.exports.registerCommands = async function() {
    await restClient.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), 
        { body: [] }
    );
    
    await restClient.put(
        Routes.applicationCommands(CLIENT_ID, SERVER_ID),
        { body: commandDatums }
    );
}