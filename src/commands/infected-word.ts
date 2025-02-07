import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { WordsDatabase } from "../db";

import { ConfigHandler } from "../config";
const { Channels, Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('infected-word')
		.setDescription('sends the current infected word'),
	init: () => {},
	authorizedRoleIDs: [Roles.InfectedZombbblob],
	permittedChannelIDs: [Channels.zombbblob],
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const deferredReply = await interaction.deferReply();
		await deferredReply.edit(`The infected word is \`${WordsDatabase.getInstance().getInfectedWord()}\``);
	}
};