import { ApplicationCommandOptionType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.addUserOption(option => option
			.setName('user')
			.setDescription('Mention a user')
			.setRequired(true))
		.addIntegerOption(option => option
			.setName('timeout_length_in_sec')
			.setDescription('How long (sec) the timeout will be')
			.setRequired(true))
		.addStringOption(option => option
			.setName('reason')
			.setDescription('The logged reason for this timeout')
			.setRequired(false))
		.setDescription('times out a user for some amount of seconds'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const targetUser = interaction.options.getUser('user', true);
		const timeoutLengthSeconds = interaction.options.getInteger('timeout_length_in_sec', true);
		
		const reason = `By ${interaction.user.tag}: ${interaction.options.getString('reason') ?? 'They deserved it'}`;
		
		const targetMember = await interaction.guild.members.fetch(targetUser.id)
			.then(member => member)
			.catch(_ => null);

		if (targetMember === null) {
			await interaction.reply("Failed to fetch target member, maybe they left or got kicked/banned?");
			return;
		}

		const resultMessage = await targetMember.timeout(1000 * timeoutLengthSeconds, reason)
			.then(() => `Timed out <@${targetUser.id}> for ${timeoutLengthSeconds} seconds`)
			.catch(() => `Unable to time out <@${targetUser.id}>.`);

		await interaction.reply(resultMessage);
	},
};