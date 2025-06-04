import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../../command';

import { ConfigHandler } from '../../../../config/config';
import { ZipGameDatabase } from '../../../../fun/zipgamedb';
import { secondsToTimeString } from '../../../../fun/zipgame';
const { Channels, Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('zip-stats')
		.setDescription('see your Zip stats'),
	init: () => {},
	permittedChannelIDs: [Channels.oldtimers],
	authorizedRoleIDs: [Roles.Student, Roles.StudentAlumni],
	execute: async (interaction: ChatInputCommandInteraction) => {
		const userStats = ZipGameDatabase.getInstance().getUserStats(interaction.user.id);
		
		if (userStats === undefined) {
			await interaction.reply("You need at least 5 submissions to use this command!");
			return;
		}

		console.log(userStats)

		await interaction.reply(
			`Average Time: ${secondsToTimeString(userStats.averageTime)} ` +
			`(Rank ${userStats.timeRank}/${userStats.userCount})\n` +

			"Average Backtracks: " + 
			(userStats.averageBacktracks === null ? 
				"N/A\n" : 
				`${userStats.averageBacktracks} ` +
				`(Rank ${userStats.backtracksRank}/${userStats.usersWithBacktracksCount})\n`) + 
				
			`Submissions: ${userStats.submissionsCount} ` + 
			`(Rank ${userStats.submissionsRank}/${userStats.userCount})`
		)
	}
};