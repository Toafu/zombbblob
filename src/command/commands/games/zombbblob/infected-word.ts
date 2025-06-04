import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../command";

import { WordsDatabase } from "../../../../games/zombbblobdb";

import { ConfigHandler } from "../../../../config/config";
import { maintainersPingString } from "../../../../utils";
const { Channels, Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('infected-word')
		.setDescription('sends the current infected word'),
	init: () => {},
	authorizedRoleIDs: [Roles.InfectedZombbblob],
	permittedChannelIDs: [Channels.zombbblob],
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const db = WordsDatabase.getInstance();

		if (!db.isGameRunning()) {
			await interaction.reply({content: `The zombbblob minigame isn't currently running!`, ephemeral: true});
			return;
		}

		const infectedWord = db.getInfectedWord();
		
		if (infectedWord === null) {
			await interaction.reply(`I was unable to get the infected word! ${maintainersPingString} pls fix`);
			return;
		}

		await interaction.reply(`The infected word is \`${infectedWord}\``);
	}
};