import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { WordsDatabase } from "../db";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('add-word')
		.addStringOption(option => option
			.setName('word')
			.setDescription('A word eligible for infection')
			.setRequired(true))
		.setDescription('adds a word to the zombbblob minigame'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.guild) {
			return;
		}

		const word = interaction.options.getString('word', true);

		if (/\s/.test(word)) { // If word contains whitespace, throw
			await interaction.reply(`The word should not have whitespace! \`${word}\``);
			return;
		}

		WordsDatabase.getInstance().insertWord(word);
		await interaction.reply(`Successfully added \`${word}\` to the zombbblob minigame`);
	}
};