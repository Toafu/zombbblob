import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";
import { ZipGameDatabase } from "../games/zipgamedb";

import { ConfigHandler } from "../config";
const { Channels } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("zip-average")
		.setDescription("average stats of Zip game"),
	permittedChannelIDs: [Channels.oldtimers],
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		const averageStats = ZipGameDatabase.getInstance().getAverageStats();

		if (averageStats.average_time === null || averageStats.average_backtracks === null) {
			await interaction.reply("No one has played Zip yet!");
			return;
		}

		const averageTimeSeconds = averageStats.average_time % 60;
		const averageTimeMinutes = Math.floor(averageStats.average_time / 60);

		await interaction.reply(
			"Average Zip stats for the EECS281 Discord over " + 
			`${averageStats.num_submissions} submissions and ${averageStats.days_played} days:\n` +
			`Time: ${averageTimeMinutes}:${averageTimeSeconds.toString().padStart(2, "0")}\n` +
			`Backtracks: ${averageStats.average_backtracks}`
		)
	},
};
