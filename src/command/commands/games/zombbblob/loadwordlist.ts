import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../command";
import { WordsDatabase } from "../../../../fun/zombbblobdb";
import { INVALID_ZOMBBBLOB_WORD_REGEX } from "../../../../utils";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("loadwordlist")
		.addAttachmentOption((option) =>
			option
				.setName("words_file")
				.setDescription("A text file with the base word list")
				.setRequired(true)
		)
		.setDescription("Put a list of words into a database."),
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.guild) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		const db = WordsDatabase.getInstance();

		const isRunning = db.isGameRunning();
		if (isRunning) {
			await deferredReply.edit("Cannot initialize word list while game is running!");
			return;
		}

		const wordsFile = await interaction.options.getAttachment(
			"words_file",
			true
		);

		if (!wordsFile.name.endsWith(".txt")) {
			await deferredReply.edit("Words file must be a text (`.txt`) file!");
			return;
		}
 
		const response = await fetch(wordsFile.url);

		const buf = Buffer.from(await response.arrayBuffer()).toString().trim();

		const words = buf.split("\n")

		for (const word of words) {
			if (INVALID_ZOMBBBLOB_WORD_REGEX.test(word)) {
				await deferredReply.edit(`Words in the file should not have whitespace! \`${word}\``);
				return;
			}
			db.insertWord(word);
		}
		await deferredReply.edit(`Added ${words.length} infected words.`)
	},
};
