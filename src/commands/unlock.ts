import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { EXAM_LOCK_DISABLED_ROLE_NAME } from '../utils';
import { Command } from '../command';

import { ConfigHandler } from "../config";
const { Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('unlocks the server to Students (able to communicate)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const studentRole = await interaction.guild.roles.fetch(Roles.Student, {force: true});
		if (studentRole === null) {
			await interaction.reply("Could not fetch Student role");
			return;
		}

		const examLockedRole = await interaction.guild.roles.fetch(Roles.ExamLocked);
		if (examLockedRole === null) {
			await interaction.reply("Could not fetch Exam Locked role");
			return;
		}

		await examLockedRole.setName(EXAM_LOCK_DISABLED_ROLE_NAME);

		const deferredReply = await interaction.deferReply({ephemeral: true});

		for (const student of studentRole.members.values()) {
			try {
				await student.roles.remove(Roles.ExamLocked);
			} catch (e) {
				console.error(e);
				await deferredReply.edit(`Failed to give Exam Locked role to <@${student.id}>... Terminating...`);
				return;
			}
		}

		await deferredReply.edit("Server unlocked!");
	}
};