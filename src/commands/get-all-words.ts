import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";
import { WordsDatabase } from "../db";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("get-all-words")
		.setDescription("extract word list into a text file"),
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.guild) {
			return;
		}

		const words = WordsDatabase.getInstance().getAllWords().map(w => w.word).join('\n');

		if (!words) {
			interaction.reply("There are no infected words!");
			return;
		}

		const file = new AttachmentBuilder(Buffer.from(words), {
			name: "words.txt", description: "current infected word list"
		});

		interaction.reply({content: 'Here is the current word list', files: [file]});
	},
};
