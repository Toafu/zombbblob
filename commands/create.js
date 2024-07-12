const { ChannelType, PermissionsBitField } = require("discord.js");
const { Semesters, Roles: { Staff } } = require('../utils');

//the ability to create channels for a semester (e.g. /create F22)
module.exports = {
	slash: true,
	name: 'create',
	category: 'potatobot',
	minArgs: 1,
	maxArgs: 1,
	options: [
		{
			name: 'semester',
			description: 'Provide a semester and year formatted like F22',
			required: true,
			type: 3,
		}
	],
	expectedArgs: "<[F/S/W][Last two digits of year]>",
	description: 'creates a category for channels of this semester',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, text, interaction: msgInt }) => {
		const semester = text.toLowerCase();
		if (semester.length === 3 && (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w'))) {
			let categoryName = Semesters[semester.at(0)];
			let year = semester.slice(1); //Remove first character
			year = year.padStart(4, '20'); //Pads up to 4 character string, so you can technically say 2022
			categoryName = categoryName + ` ${year}`;
			const category = guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory });
			let categoryChannel;
			category.then(c => { categoryChannel = c; c.setPosition(4); }); //Staff-Only Channels is at Position 0
			const channels = ['general', 'labs', 'random', 'project-1', 'project-2', 'project-3', 'project-4', 'midterm-exam', 'final-exam'];
			// Create the public channels normally
			for (let i = 0; i <= 2; ++i) {
				guild.channels.create({ name: channels[i], type: ChannelType.GuildText })
					.then(channel => { channel.setParent(categoryChannel); })
					.catch(() => { msgInt.reply("Unable to create category's public channels"); return; });
			}
			// Create the private channels with permissions already constructed
			for (let i = 3; i < channels.length; ++i) {
				guild.channels.create({
					name: channels[i],
					type: ChannelType.GuildText,
					permissionOverwrites: [
						{	// Disabling @everyone makes channel private
							id: guild.roles.everyone,
							deny: [PermissionsBitField.Flags.ViewChannel]
						},
						{
							id: Staff,
							allow: [PermissionsBitField.Flags.ViewChannel]
						},
					]
				})
					.then(channel => { channel.setParent(categoryChannel, { lockPermissions: false }); })
					.catch(() => { msgInt.reply("Unable to create category's private channels"); return; });
			}
			msgInt.reply(`${categoryName} successfully created`);
		} else {
			msgInt.reply('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};