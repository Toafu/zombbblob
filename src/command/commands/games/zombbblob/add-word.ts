import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../command";

import { WordsDatabase } from "../../../../games/zombbblobdb";
import { INVALID_ZOMBBBLOB_WORD_REGEX } from "../../../../utils";

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

		if (INVALID_ZOMBBBLOB_WORD_REGEX.test(word)) {
			await interaction.reply(`That word has an invalid character! \`${word}\``);
			return;
		}

		WordsDatabase.getInstance().insertWord(word);
		await interaction.reply(`Successfully added \`${word}\` to the zombbblob minigame`);
	}
};