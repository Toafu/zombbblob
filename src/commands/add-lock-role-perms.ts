import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';

import { ConfigHandler } from "../config";
import { addLockRollPermsToChannel } from '../utils';
const { Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('add-lock-role-perms')
		.setDescription('Add the locked role restrictions to channels (does NOT lock the server)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const examLockedRole = await interaction.guild.roles.fetch(Roles.ExamLocked);
		if (examLockedRole === null) {
			await interaction.reply("Could not fetch Exam Locked role");
			return;
		}

        const deferredReply = await interaction.deferReply({ephemeral: true});

        for (const channel of (await interaction.guild.channels.fetch()).values()) {
            if (channel === null) {
                continue;
            }

            try {
                await addLockRollPermsToChannel(channel);
            } catch (e) {
                console.error(e);
                await deferredReply.edit(`Failed to set permissions for <#${channel.id}>... Terminating...`);
                return;
            }
        }

        await deferredReply.edit("Added permissions for locked role (did **not** lock server)!");
	}
};