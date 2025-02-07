import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { WordsDatabase } from "../db";

import { ConfigHandler } from "../config";
const { MAINTAINER_ID, Channels, Roles } = ConfigHandler.getInstance().getConfig();

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

		const db = WordsDatabase.getInstance();

		if (!db.isGameRunning()) {
			const errorReply = await interaction.deferReply({ ephemeral: true });
			await errorReply.edit(`The zombbblob minigame isn't currently running!`);
			return;
		}

		const infectedWord = db.getInfectedWord();
		
		if (infectedWord === null) {
			const errorReply = await interaction.deferReply();
			await errorReply.edit(`I was unable to get the infected word! <@${MAINTAINER_ID}> pls fix`);
			return;
		}

		const deferredReply = await interaction.deferReply();
		await deferredReply.edit(`The infected word is \`${infectedWord}\``);
	}
};