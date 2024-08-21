const { SlashCommandBuilder } = require("discord.js");
const { Roles: { Student, StudentAlumni } } = require('../utils');

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
module.exports = {
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
		.setDescription('Assigns students from start date to end date with the Student Alumni Role'),
	init: (client) => { //For automagic detectionsc
		const checkAlumnize = () => {
			const beforeThreshold = new Date; //Get today's Date
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
				client.guilds.fetch('734492640216744017').then(g => {
					g.members.fetch().then(u => { //Cache all members
						g.roles.fetch(Student).then(r => { //Extract members with the Student role
							r.members.each(user => { //r.members is a Collection<userID, GuildMember>
								if (user.joinedAt < beforeThreshold) {
									user.roles.remove(Student);
									user.roles.add(StudentAlumni);
									++count;
								}
							});
							g.channels.fetch('734554759662665909').then(c => { //#server-log
								c.send(`Students automatically alumnized: ${count}.`);
							});
						});
					})
						.catch(console.error);
				});
			};
			setTimeout(checkAlumnize, 1000 * 60 * 60 * 24);
		};
		checkAlumnize();
	},
	execute: async (interaction) => {
		const startDateArg = interaction.options.getString('start_date');
		const endDateArg = interaction.options.getString('end_date');

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
		interaction.guild.members.fetch().then(u => { //Cache all members
			interaction.guild.roles.fetch(Student).then(r => { //Extract members with the Student role
				r.members.each(user => { //r.members is a Collection<userID, GuildMember>
					if (user.joinedAt > start && user.joinedAt < end) {
						user.roles.remove(Student);
						user.roles.add(StudentAlumni);
						++count;
					}
				});
				interaction.reply(`Students Alumnized: ${count}.`);
			});
		})
			.catch(console.error);
	}
};