import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../command';

import { ConfigHandler } from "../../../config/config";
const { Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('sync-lock-role')
		.setDescription('student role <=> lock role'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null || interaction.channel === null || !interaction.channel.isSendable()) {
			return;
		}

		const deferredReply = await interaction.deferReply({ephemeral: true});

		const studentRole = await interaction.guild.roles.fetch(Roles.Student);
		if (studentRole === null) {
			await deferredReply.edit("Could not fetch Student role");
			return;
		}

		const examLockedRole = await interaction.guild.roles.fetch(Roles.ExamLocked);
		if (examLockedRole === null) {
			await deferredReply.edit("Could not fetch Exam Locked role");
			return;
		}

        for (const student of studentRole.members.values()) {
            await student.roles.add(examLockedRole);
        }

		await deferredReply.edit("All students now have lock role!");
	}
};