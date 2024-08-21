import { BaseGuildTextChannel, ChannelType, ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Channels, Semesters, Roles } from '../utils';
import { Command } from "../command";

//the ability to create channels for a semester (e.g. /create F22)
export const create: Command = {
	data: new SlashCommandBuilder()
		.setName('create')
		.addStringOption(option => option
			.setName('semester')
			.setDescription('Provide a semester and year formatted like F22')
			.setRequired(true))
		.setDescription('creates a category for channels of this semester'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.guild) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		const semester = interaction.options.getString('semester', true).toLowerCase();
		if (semester.length === 3 && (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w'))) {
			const year = semester.slice(1).padStart(4, '20'); //Remove first character, pad YY into YYYY
			const categoryName = `${Semesters.get(semester[0])} ${year}`;
			
			const categoryChannel = await interaction.guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory });;
			await categoryChannel.setPosition(4); //Staff-Only Channels is at Position 0
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
							id: Roles.Staff,
							allow: [PermissionsBitField.Flags.ViewChannel]
						},
					]
				})
					.then(channel => { channel.setParent(categoryChannel, { lockPermissions: false }); })
					.catch(() => { deferredReply.edit("Unable to create category's private channels"); return; });
			}
			// Find #piano-gang and #old-timers and move them to the current semester under the public channels
			const pianoGangChannel = (await interaction.guild.channels.fetch(Channels.pianogang)) as BaseGuildTextChannel;
			await pianoGangChannel.setParent(categoryChannel);
			await pianoGangChannel.setPosition(3);

			const oldTimersChannel = (await interaction.guild.channels.fetch(Channels.oldtimers)) as BaseGuildTextChannel;
			await oldTimersChannel.setParent(categoryChannel);
			await oldTimersChannel.setPosition(4);

			deferredReply.edit(`${categoryName} successfully created. Remember to also fix the Onboarding settings for Students.`);
		} else {
			deferredReply.edit('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};