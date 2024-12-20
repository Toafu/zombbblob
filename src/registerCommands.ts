require('dotenv').config();

import {REST, Routes} from 'discord.js';
import fs from 'fs';
import path from 'path';

import {ConfigHandler} from './config';
const {CLIENT_ID, SERVER_ID} = ConfigHandler.getInstance().getConfig();

export const registerCommands = async function () {
  console.log('Registering commands...');

  if (!process.env.TOKEN) {
    throw new Error('No TOKEN in ENV!');
  }

  const restClient = new REST().setToken(process.env.TOKEN);

  const commandsDirectoryPath = path.join(__dirname, 'commands/');
  const commandDatums = await Promise.all(
    fs.readdirSync(commandsDirectoryPath).map(async commandFileName => {
      const {command} = await import(
        path.join(commandsDirectoryPath, commandFileName)
      );
      return command.data.toJSON();
    }),
  );

  console.log('Clearing old commands...');
  await restClient.put(Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), {
    body: [],
  });

  console.log('Inserting new commands...');
  await restClient.put(Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), {
    body: commandDatums,
  });
};
