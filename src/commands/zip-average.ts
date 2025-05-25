import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";
import { AverageStatsResponse, ZipGameDatabase } from "../games/zipgamedb";

import { ConfigHandler } from "../config";
import { secondsToTimeString } from "../games/zipgame";
const { Channels, Roles } = ConfigHandler.getInstance().getConfig();

function averageTimeAndBacktracksString(averageStats: AverageStatsResponse): string {
	const timeString = averageStats.average_time === null ? 
							"N/A " : 
							secondsToTimeString(averageStats.average_time);

	const backtracksString = averageStats.average_backtracks === null ?
							"N/A " :
							averageStats.average_backtracks.toFixed(1);
	
	return `${timeString}    ${backtracksString}      `
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

		/*

		**`          Time    Backtracks`**
		`Today:    0:15    N/A       `
		`Week:     0:25    4.2       `
		`All-Time: 0:30    3.3       `

		*/

		await interaction.reply(
			"**" +
			`\`          Time    Backtracks\``+
			"**\n" +
			`\`Today:    ${averageTimeAndBacktracksString(ZipGameDatabase.getInstance().getTodaysAverageStats())}\`\n` + 
			`\`Week:     ${averageTimeAndBacktracksString(ZipGameDatabase.getInstance().getWeeksAverageStats())}\`\n` + 
			`\`All-Time: ${averageTimeAndBacktracksString(ZipGameDatabase.getInstance().getAverageStats())}\``
		)
	},
};
