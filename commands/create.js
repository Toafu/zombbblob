const { ChannelType, PermissionsBitField, SlashCommandBuilder } = require("discord.js");
const { Channels, Semesters, Roles: { Staff } } = require('../utils');

//the ability to create channels for a semester (e.g. /create F22)
module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.addStringOption(option => option
			.setName('semester')
			.setDescription('Provide a semester and year formatted like F22')
			.setRequired(true))
		.setDescription('creates a category for channels of this semester'),
	execute: async (interaction) => {
		const deferredReply = await interaction.deferReply();

		const semester = interaction.options.getString('semester').toLowerCase();
		if (semester.length === 3 && (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w'))) {
			let categoryName = Semesters[semester.at(0)];
			let year = semester.slice(1); //Remove first character
			year = year.padStart(4, '20'); //Pads up to 4 character string, so you can technically say 2022
			categoryName = categoryName + ` ${year}`;
			const category = interaction.guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory });
			let categoryChannel;
			category.then(c => { categoryChannel = c; c.setPosition(4); }); //Staff-Only Channels is at Position 0
			const channels = ['general', 'labs', 'random', 'project-1', 'project-2', 'project-3', 'project-4', 'midterm-exam', 'final-exam'];
			// Create the public channels normally
			for (let i = 0; i <= 2; ++i) {
				await interaction.guild.channels.create({ name: channels[i], type: ChannelType.GuildText })
					.then(channel => { channel.setParent(categoryChannel); })
					.catch(() => { deferredReply.edit("Unable to create category's public channels"); return; });
			}
			// Create the private channels with permissions already constructed
			for (let i = 3; i < channels.length; ++i) {
				await interaction.guild.channels.create({
					name: channels[i],
					type: ChannelType.GuildText,
					permissionOverwrites: [
						{	// Disabling @everyone makes channel private
							id: interaction.guild.roles.everyone,
							deny: [PermissionsBitField.Flags.ViewChannel]
						},
						{
							id: Staff,
							allow: [PermissionsBitField.Flags.ViewChannel]
						},
					]
				})
					.then(channel => { channel.setParent(categoryChannel, { lockPermissions: false }); })
					.catch(() => { deferredReply.edit("Unable to create category's private channels"); return; });
			}
			// Find #piano-gang and #old-timers and move them to the current semester under the public channels
			await interaction.guild.channels.fetch(Channels.pianogang).then(c => {
				c.setParent(categoryChannel)
					.then(ch => ch.setPosition(3));
			}).catch(() => { deferredReply.edit(`Unable to move <#${Channels.pianogang}>,`); return; });
			await interaction.guild.channels.fetch(Channels.oldtimers).then(c => {
				c.setParent(categoryChannel)
					.then(ch => ch.setPosition(4));
			}).catch(() => { deferredReply.edit(`Unable to move <#${Channels.oldtimers}>,`); return; });
			deferredReply.edit(`${categoryName} successfully created. Remember to also fix the Onboarding settings for Students.`);
		} else {
			deferredReply.edit('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};