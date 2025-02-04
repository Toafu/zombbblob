import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

import { WordsDatabase } from "../db";
import { ConfigHandler } from '../config';
const { MAINTAINER_ID, Roles } = ConfigHandler.getInstance().getConfig();

const HOUR = 60 * 60 * 1000;

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('reroll')
		.setDescription('changes the infected word'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}
		const db = WordsDatabase.getInstance()

		if (!db.isGameRunning()) {
			const errorReply = await interaction.deferReply({ ephemeral: true });
			await errorReply.edit(`The zombbblob minigame isn't running yet! Try \`/start-zombbblob\``);
			return;
		}

		const lastInfected = db.getLastInfected();
		if (lastInfected) {
			const now = Date.now();
			const timeDiff = now - lastInfected.getTime();
			if (timeDiff < HOUR) {
				const errorReply = await interaction.deferReply({ ephemeral: true });
				await errorReply.edit(`Reroll is currently on cooldown. ` +
								      `The cooldown will end on a new infection or <t:${Math.floor(((now + HOUR) - timeDiff) / 1000)}:R>`);
				return;
			}
		}

		const word = db.infectRandomWord();
		if (word === null) {
			const errorReply = await interaction.deferReply({ ephemeral: true });
			await errorReply.edit(`I was unable to infect a word! <@${MAINTAINER_ID}> pls fix`);
			return;
		}
		db.setLastInfected(new Date());
		const deferredReply = await interaction.deferReply();
		await deferredReply.edit(`The new infected word is \`${word}\``)
	},
	authorizedRoleIDs: [Roles.InfectedZombbblob]
};