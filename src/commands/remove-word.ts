import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { WordsDatabase } from "../db";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('remove-word')
		.addStringOption(option => option
			.setName('word')
			.setDescription('A word to no longer be eligible for infection')
			.setRequired(true))
		.setDescription('removes a word from the zombbblob minigame'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.guild) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		const word = interaction.options.getString('word', true);
		const success = WordsDatabase.getInstance().removeWord(word);
		if (success) {
			await deferredReply.edit(`Successfully deleted \`${word}\` from the zombbblob minigame`);
		} else {
			await deferredReply.edit(`Unable to delete \`${word}\` from the zombbblob minigame (the word doesn't exist or is currently infected)`);
		}
	}
};