import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";
import { Command } from "../command";

import { ZipGameDatabase } from "../games/zipgamedb";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("zip-get-latest-submission")
		.addUserOption(option => option
			.setName("submitter")
			.setDescription("Submitter")
			.setRequired(true)
		)
		.setDescription("get latest submission of user"),
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		const result = 
			ZipGameDatabase.getInstance()
							.getSubmission(interaction.options.getUser("submitter", true).id);

		if (result === undefined) {
			await interaction.reply({
				content: "That user has no submission in the database.",
				flags: "Ephemeral"
			});
			return;
		}

		await interaction.reply({
			content: `https://discord.com/channels/1325691299713777684/1325692497741221929/${result.message_id}`,
			flags: "Ephemeral"
		});
	},
};