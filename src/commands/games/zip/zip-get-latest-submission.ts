import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../command";

import { ZipGameDatabase } from "../../../games/zipgamedb";

import { ConfigHandler } from "../../../config";
const { SERVER_ID, Channels } = ConfigHandler.getInstance().getConfig();

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
							.getLatestSubmission(interaction.options.getUser("submitter", true).id);

		if (result === undefined) {
			await interaction.reply({
				content: "That user has no submission in the database.",
				flags: "Ephemeral"
			});
			return;
		}

		await interaction.reply({
			content: `https://discord.com/channels/${SERVER_ID}/${Channels.oldtimers}/${result.message_id}`,
			flags: "Ephemeral"
		});
	},
};