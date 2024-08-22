require('dotenv').config()

import { REST, Routes } from 'discord.js';

import { CLIENT_ID, SERVER_ID } from './utils'
import { Command } from './command';

const commands: Map<String, Command> = new Map();
import { alumnize } from "./commands/alumnize";
commands.set("alumnize", alumnize);
import { archive } from "./commands/archive";
commands.set("archive", archive);
import { assign } from "./commands/assign";
commands.set("assign", assign);
import { create } from "./commands/create";
commands.set("create", create);
import { demote } from "./commands/demote";
commands.set("demote", demote);
import { invite } from "./commands/invite";
commands.set("invite", invite);
import { lock } from "./commands/lock";
commands.set("lock", lock);
import { open } from "./commands/open";
commands.set("open", open);
import { react } from "./commands/react";
commands.set("react", react);
import { reply } from "./commands/reply";
commands.set("reply", reply);
import { send } from "./commands/send";
commands.set("send", send);
import { timeout } from "./commands/timeout";
commands.set("timeout", timeout);
import { unlock } from "./commands/unlock";
commands.set("unlock", unlock);

const commandDatums = [...commands.values()].map(command => command.data.toJSON());

if (!process.env.TOKEN) {
    console.error("No TOKEN in ENV!");
    process.exit(1);
}

const restClient = new REST().setToken(process.env.TOKEN);

export const registerCommands = async function() {
    await restClient.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), 
        { body: [] }
    );
    
    await restClient.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID),
        { body: commandDatums }
    );
}