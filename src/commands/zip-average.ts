import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";
import { AverageStatsResponse, ZipGameDatabase } from "../games/zipgamedb";

import { ConfigHandler } from "../config";
import { secondsToTimeString } from "../games/zipgame";
const { Channels, Roles } = ConfigHandler.getInstance().getConfig();

function averageTimeAndBacktracksString(averageStats: AverageStatsResponse): string {
	if (averageStats.average_time === null || averageStats.average_backtracks === null) {
		return "No results!";
	}

	return  `Time: ${secondsToTimeString(averageStats.average_time)}\n` +
			`Backtracks: ${averageStats.average_backtracks.toFixed(1)}\n`;
}

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("zip-average")
		.setDescription("average stats of Zip game"),
	permittedChannelIDs: [Channels.oldtimers],
	authorizedRoleIDs: [Roles.Student, Roles.StudentAlumni],
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
