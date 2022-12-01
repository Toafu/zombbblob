const { ApplicationCommandOptionType } = require("discord.js");
const studentRole = '926186372572799037';
const studentAlumRole = '748920659626950737';
/*
the ability to autoassign students the alumni role at the end of a semester. 
Currently, the bot goes through all the users with a student role and assigns them with the alumni role on 
1/1 (for all users that joined on or before 12/20 of the previous year), 
5/1 (for all users that joined on or before 4/27), 
and 7/1 (for all users that joined on or before 6/30). 
However, there's probably a better way to do this (you can also range assign a role using a command like /alumnize 2021-12-21 2021-12-31
*/
module.exports = {
	slash: true,
	name: 'alumnize',
	category: 'potatobot',
	minArgs: 2,
	maxArgs: 2,
	options: [
		{
			name: 'start_date',
			description: 'Provide a date (YYYY-MM-DD)',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'end_date',
			description: 'Provide a date (YYYY-MM-DD)',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
	],
	expectedArgs: "<[YYYY-MM-DD] [YYY-MM-DD]>",
	description: 'Assigns students from start date to end date with the Student Alumni Role',
	testOnly: true, //so the slash command updates instantly
	// init: (client) => { //For automagic detections
	// 	setTimeout(() => {
	// 		const now = new Date;
	// 		if (now.getDate() == 1 && (now.getMonth() == 0 || now.getMonth() == 4 || now.getMonth() == 6)) {
	// 			//getDate() is 1-indexed but getMonth() is 0-indexed
	// 			now.setDate(2); //So we get on or before today!
	// 			client.guilds.fetch('734492640216744017').then(g => {
	// 				g.members.fetch().then(u => { //Cache all members
	// 					g.roles.fetch(studentRole).then(r => { //Extract members with the Student role
	// 						r.members.each(user => { //r.members is a Collection<userID, GuildMember>
	// 							if (user.joinedAt < now) {
	// 								user.roles.add('748920659626950737'); //Targets bots for safety
	// 								++count;
	// 							}
	// 						});
	// 						g.channels.fetch('749407788156846162').then(c => { //#bot-commands
	// 							c.send(`Students automatically alumnized: ${count}.`);
	// 						})
	// 					});
	// 				})
	// 				.catch(console.error);
	// 			})
	// 		}
	// 	}, 1000 * 60 * 60 * 24);
	// },
	callback: async ({ guild, args, interaction: msgInt }) => {
		if (args[0].length != 10 || args[1].length != 10) { //Basic error checking. Not perfect.
			msgInt.reply(`Please make sure dates are of the form YYYY-MM-DD`);
			return;
		} else {
			const start = new Date(args[0] + "T12:00");
			const end = new Date(args[1] + "T12:00");
			if (start.toString() == "Invalid Date" || end.toString() == "Invalid Date") {
				msgInt.reply("Failed to detect date. Please make sure dates are of the form YYYY-MM-DD.");
				return;
			}
			let count = 0;
			guild.members.fetch().then(u => { //Cache all members
				guild.roles.fetch(studentRole).then(r => { //Extract members with the Student role
					r.members.each(user => { //r.members is a Collection<userID, GuildMember>
						if (user.joinedAt > start && user.joinedAt < end) {
							user.roles.add(studentAlumRole);
							++count;
						}
					});
					msgInt.reply(`Students Alumnized: ${count}.`);
				});
			})
			.catch(console.error);
		}
	}
};