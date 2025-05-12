import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";
import { AverageStatsResponse, ZipGameDatabase } from "../games/zipgamedb";

import { ConfigHandler } from "../config";
const { Channels } = ConfigHandler.getInstance().getConfig();

function averageTimeAndBacktracksString(averageStats: AverageStatsResponse): string {
	if (averageStats.average_time === null || averageStats.average_backtracks === null) {
		return "No results!";
	}

	const averageTimeSeconds = averageStats.average_time % 60;
	const averageTimeMinutes = Math.floor(averageStats.average_time / 60);

	return  `Time: ${averageTimeMinutes}:${averageTimeSeconds.toFixed(0).padStart(2, "0")}\n` +
			`Backtracks: ${averageStats.average_backtracks.toFixed(1)}\n`;
}

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("zip-average")
		.setDescription("average stats of Zip game"),
	permittedChannelIDs: [Channels.oldtimers],
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		const averageStats = ZipGameDatabase.getInstance().getAverageStats();

		await interaction.reply(
			"Average Zip stats for the EECS281 Discord\n\n" + 
			"Today:\n" +
			`${averageTimeAndBacktracksString(ZipGameDatabase.getInstance().getTodaysAverageStats())}\n` +
			`All time (${averageStats.num_submissions} submissions and ${averageStats.days_played} days):\n` +
			averageTimeAndBacktracksString(averageStats)
		)
	},
};
