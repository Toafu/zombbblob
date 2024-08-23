import { BaseGuildTextChannel, ChatInputCommandInteraction, Client, Guild, GuildBasedChannel, GuildMember, SlashCommandBuilder } from "discord.js";
import { Channels, Roles, SERVER_ID } from '../utils';
import { Command } from "../command";

const beforeMap = {
	0: { month: 11, day: 20 }, 	// 1/1 (for all users that joined on or before 12/20 of the previous year)
	4: { month: 3, day: 27 }, 	// 5/1 (for all users that joined on or before 4/27)
	6: { month: 5, day: 30 }, 	// 7/1 (for all users that joined on or before 6/30)
};

/*
the ability to autoassign students the alumni role at the end of a semester. 
Currently, the bot goes through all the users with a student role and assigns them with the alumni role on 
However, there's probably a better way to do this (you can also range assign a role using a command like /alumnize 2021-12-21 2021-12-31
*/
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('alumnize')
		.addStringOption(option => option
			.setName('start_date')
			.setDescription('Provide a date (YYYY-MM-DD)')
			.setRequired(true))
		.addStringOption(option => option
			.setName('end_date')
			.setDescription('Provide a date (YYYY-MM-DD)')
			.setRequired(true))
		.setDescription('Assigns students from start date to end date with the Roles.Student Alumni Role'),
	init: (client: Client<boolean>) => { //For automagic detections
		const checkAlumnize = async () => {
			const beforeThreshold = new Date(); //Get today's Date
			const currMonth = beforeThreshold.getMonth();
			if (beforeThreshold.getDate() == 1 && (currMonth == 0 || currMonth == 4 || currMonth == 6)) {
				//getDate() is 1-indexed but getMonth() is 0-indexed
				if (currMonth == 0) { //Decrement year if checking on New Year's
					beforeThreshold.setFullYear(beforeThreshold.getFullYear() - 1);
				}
				let count = 0;
				//Use beforeMap to get the desired target join threshold
				beforeThreshold.setMonth(beforeMap[currMonth].month);
				beforeThreshold.setDate(beforeMap[currMonth].day);
				
				const guild = await client.guilds.fetch(SERVER_ID);
				// put guild members into cache
				await guild.members.fetch();
				const studentRole = await guild.roles.fetch(Roles.Student);

				if (studentRole === null) {
					console.error("Could not fetch student role!");
					process.exit(1);
				}

				studentRole.members.each(member => { //r.members is a Collection<userID, GuildMember>
					if (member.joinedAt === null) {
						throw "fix";
					}
					if (member.joinedAt < beforeThreshold) {
						member.roles.remove(Roles.Student);
						member.roles.add(Roles.StudentAlumni);
						++count;
					}
				});

				const serverLog = await guild.channels.fetch(Channels.serverlog);
				
				if (serverLog === null) {
					console.error("Server log channel invalid!");
					process.exit(1);
				}
				
				if (!serverLog.isTextBased()) {
					console.error("Server log channel is not a text channel");
					process.exit(1);
				}

				serverLog.send(`Students automatically alumnized: ${count}.`);
			};
			setTimeout(checkAlumnize, 1000 * 60 * 60 * 24);
		};
		checkAlumnize();
	},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null || interaction.channel === null) {
			return;
		}

		const startDateArg = interaction.options.getString('start_date', true);
		const endDateArg = interaction.options.getString('end_date', true);

		if (startDateArg.length != 10 || endDateArg.length != 10) {
			await interaction.reply('Please make sure dates are of the form YYYY-MM-DD');
			return;
		}

		const start = new Date(startDateArg + "T12:00");
		const end = new Date(endDateArg + "T12:00");
		if (start.toString() == "Invalid Date" || end.toString() == "Invalid Date") {
			await interaction.reply("Failed to detect date. Please make sure dates are of the form YYYY-MM-DD.");
			return;
		}
		let count = 0;
		await interaction.guild.members.fetch();

		const studentRole = await interaction.guild.roles.fetch(Roles.Student) //Extract members with the Roles.Student role
		if (studentRole === null) {
			await interaction.reply("Failed to fetch Student role!");
			return;
		}
		
		for (const member of studentRole.members.values()) {
			if (member.joinedAt === null) {
				await interaction.channel.send(`Failed to alumnize <@${member.id}> due to null join date`);
				continue;
			}
			if (member.joinedAt > start && member.joinedAt < end) {
				await member.roles.remove(Roles.Student);
				await member.roles.add(Roles.StudentAlumni);
				++count;
			}
		}
		await interaction.reply(`Students Alumnized: ${count}.`);
	}
};