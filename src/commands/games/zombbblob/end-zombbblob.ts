import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../command";

import { WordsDatabase } from "../../../games/zombbblobdb";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('end-zombbblob')
		.setDescription('ends the zombbblob minigame'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		WordsDatabase.getInstance().setGameRunning(false);

		await interaction.reply("Ended zombbblob minigame.");
	}
};