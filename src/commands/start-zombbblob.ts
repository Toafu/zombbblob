import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { WordsDatabase } from "../db";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('start-zombbblob')
		.setDescription('starts the zombbblob minigame'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		WordsDatabase.getInstance().setGameRunning(true);

		await deferredReply.edit(`Started zombbblob minigame.`)
	}
};