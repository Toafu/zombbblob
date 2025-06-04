import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../command";

import { WordsDatabase } from "../../../../games/zombbblobdb";
import { ConfigHandler } from '../../../../config/config';
import { maintainersPingString } from "../../../../utils";
const { Roles, Channels } = ConfigHandler.getInstance().getConfig();

const HOUR = 60 * 60 * 1000;

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('reroll')
		.setDescription('changes the infected word'),
	init: () => {},
	authorizedRoleIDs: [Roles.InfectedZombbblob],
	permittedChannelIDs: [Channels.zombbblob],
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}
		const db = WordsDatabase.getInstance()

		if (!db.isGameRunning()) {
			await interaction.reply({content: `The zombbblob minigame isn't currently running!`, ephemeral: true});
			return;
		}

		const lastInfected = db.getLastInfected();
		if (lastInfected) {
			const now = Date.now();
			const timeDiff = now - lastInfected.getTime();
			if (timeDiff < HOUR) {
				await interaction.reply({
					content: `Reroll is currently on cooldown. ` +
						`The cooldown will end on a new infection or <t:${Math.floor(((now + HOUR) - timeDiff) / 1000)}:R>`,
					ephemeral: true
				});
				return;
			}
		}

		const word = db.infectRandomWord();
		if (word === null) {
			await interaction.reply(`I was unable to infect a word! ${maintainersPingString} pls fix`);
			return;
		}
		db.setLastInfected(new Date());
		await interaction.reply(`The new infected word is \`${word}\``);
	},
};