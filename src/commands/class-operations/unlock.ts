import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from 'discord.js';
import { applyLockRollPermsToChannels, EXAM_LOCK_DISABLED_ROLE_NAME } from '../../utils';
import { Command } from '../../command';

import { ConfigHandler } from "../../config";
const { Roles, Channels } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('unlocks the server to Students (able to communicate)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null || interaction.channel === null || !interaction.channel.isSendable()) {
			return;
		}

		const deferredReply = await interaction.deferReply({ephemeral: true});

		const examLockedRole = await interaction.guild.roles.fetch(Roles.ExamLocked);
		if (examLockedRole === null) {
			await deferredReply.edit("Could not fetch Exam Locked role");
			return;
		}
		
		const serverLockExplanationChannel = await interaction.guild.channels.fetch(Channels.server_lock_explanation);
		if (serverLockExplanationChannel === null) {
			await deferredReply.edit("Could not fetch server lock explanation channel.");
			return;
		}

		if (!(serverLockExplanationChannel instanceof TextChannel)) {
			await deferredReply.edit("Server lock explanation channel is not a text channel, terminating.");
			return;
		}

		await examLockedRole.setName(EXAM_LOCK_DISABLED_ROLE_NAME);

		await applyLockRollPermsToChannels(interaction.guild, examLockedRole, serverLockExplanationChannel, deferredReply);

		await deferredReply.edit("Server unlocked!");
		await interaction.channel.send("Server unlocked for Student role!");
	}
};