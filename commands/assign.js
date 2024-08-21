const { ApplicationCommandOptionType, PermissionsBitField, SlashCommandBuilder } = require("discord.js");

//a way for staff to assign/remove roles
module.exports = {
	data: new SlashCommandBuilder()
		.setName('assign')
		.addUserOption(option => option
			.setName('user')
			.setDescription('Mention a user')
			.setRequired(true))
		.addRoleOption(option => option
			.setName('role')
			.setDescription('Mention a role')
			.setRequired(true))
		.setDescription('assigns a user the specified role'),
	execute: async (interaction) => {
		const targetUser = interaction.options.getUser('user');
		const targetRole = interaction.options.getRole('role');

		const targetMember = interaction.guild.members.cache.get(targetUser.id);

		await interaction.guild.members.fetch(interaction.user.id).then(async u => {
			if (targetRole.comparePositionTo(u.roles.highest) > 0 && !u.permissions.has(PermissionsBitField.Flags.Administrator)) {
				await interaction.reply(`<:blobdisapproval:1039016273343951009> You cannot assign a role that is higher than your highest role (Administrators can bypass).`);
			} else {
				await targetMember.roles.add(targetRole);
				await interaction.reply(`Successfully assigned the ${targetRole.name} role to ${targetMember.user.username}`);
			}
		});
	},
};