const { ApplicationCommandOptionType, SlashCommandBuilder } = require("discord.js");

module.exports = {
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
	execute: async (interaction) => {
		const targetUser = interaction.options.getUser('user');
		const timeoutLengthSeconds = interaction.options.getInteger('timeout_length_in_sec');
		
		const reason = `By ${interaction.user.tag}: ${interaction.options.getString('reason') ?? 'They deserved it'}`;
		
		await interaction.guild.members.fetch(targetUser.id).then(u => {
			u.timeout(1000 * timeoutLengthSeconds, reason)
				.then(() => { interaction.reply(`Timed out <@${targetUser.id}> for ${timeoutLengthSeconds} seconds`); })
				.catch(() => { interaction.reply(`Unable to time out <@${targetUser.id}>.`); });
		});
	},
};