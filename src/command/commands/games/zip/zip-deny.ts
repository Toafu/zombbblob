import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SqliteError } from "better-sqlite3";

import { Command } from "../../../command";
import { ZipGameDatabase } from "../../../../games/zipgamedb";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('zip-deny')
		.addUserOption(option => option
			.setName('user')
			.setDescription('user to add to the denylist')
			.setRequired(true))
		.setDescription("prevents a user's zip submissions from counting."),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const targetUser = interaction.options.getUser('user', true);

		try {
			ZipGameDatabase.getInstance().addToDenyList(targetUser.id);

			await interaction.reply({
				content: "Added user to the denylist. Keep in mind that any of their submissions in the DB are still present.",
				flags: "Ephemeral"
			});
		} catch (error) {
			if (!(error instanceof SqliteError) 
				|| error.code !== "SQLITE_CONSTRAINT_PRIMARYKEY") {
				throw error;
			}

			await interaction.reply({
				content: "That user is already on the denylist.",
				flags: "Ephemeral"
			});
		}
	},
};