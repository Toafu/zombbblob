import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { WordsDatabase } from "../db";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('end-zombbblob')
		.setDescription('ends the zombbblob minigame'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		WordsDatabase.getInstance().setGameRunning(false);

		await deferredReply.edit(`Ended zombbblob minigame.`);
	}
};