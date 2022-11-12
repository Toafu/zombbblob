const { ApplicationCommandOptionType } = require("discord.js");
const studentRole = '926186372572799037';
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
		  description: 'Start date of Student Alumni',
		  required: true,
		  type: ApplicationCommandOptionType.String,
		},
		{
			name: 'end_date',
			description: 'End date of Student Alumni',
			required: true,
			type: ApplicationCommandOptionType.String,
		  },
	  ],
	expectedArgs: "<[YYYY-MM-DD] [YYY-MM-DD]>",
	description: 'Assigns students from start date to end date with the Student Alumni Role',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, args, interaction: msgInt }) => {
		const start = new Date(args[0] += "T12:00");
		const end = new Date(args[1] += "T12:00");
		guild.members.fetch().then(u => { //Cache all members
			guild.roles.fetch(studentRole).then(r => { //Extract members with the Student role
				console.log(r.members.size); //r.members is a Collection<userID, GuildMember>
			});
		})
		.catch(console.error);
	}
};