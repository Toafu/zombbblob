import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';

import { ConfigHandler } from '../../config/config';
const { MAINTAINER_IDS } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('kill')
		.setDescription('calls process.exit(1). bot may restart depending on production environment (i.e. Docker)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
        if (interaction.guild === null || !(interaction.member instanceof GuildMember)) {
            return;
        }

        if (!MAINTAINER_IDS.includes(interaction.member.id)) {
            return;
        }

        process.exit(1);
	}
};