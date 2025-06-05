import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { ConfigHandler } from "../config";
const { PERMANENT_INVITE_URL, Channels } = ConfigHandler.getInstance().getConfig();

//the ability to create invites with number of uses (e.g., /invite N)
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.addIntegerOption(option => option
			.setName('n')
			.setDescription('Number of invite uses')
			.setRequired(false))
		.setDescription('creates an invite with a set number of uses (default unlimited)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const numUses = interaction.options.getInteger('n');

		if (numUses === null) {
			interaction.reply(PERMANENT_INVITE_URL);
			return;
		}

		const invite = await interaction.guild.invites.create(Channels.welcomeandrules, { maxUses: numUses, maxAge: 0 });
		await interaction.reply(`discord.gg/${invite.code}`);
	}
};