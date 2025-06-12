import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";
import { Command } from "../../../command";

import { ZipGameDatabase } from "../../../../fun/zipgamedb";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("zip-undeny")
		.addStringOption(option => option
			.setName("user_id")
			.setDescription("ID of user to remove from denylisy")
			.setRequired(true)
		)
		.setDescription("remove user from denylist"),
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		const userRemoved = 
			ZipGameDatabase.getInstance()
							.removeFromDenylist(interaction.options.getString('user_id', true));

		if (!userRemoved) {
			await interaction.reply({
				content: "That user is not on the denylist.",
				flags: "Ephemeral"
			});
			return;
		}

		await interaction.reply({
			content: "Removed user from the denylist!",
			flags: "Ephemeral"
		});
	},
};