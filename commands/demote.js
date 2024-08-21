const { ApplicationCommandOptionType, PermissionsBitField, SlashCommandBuilder } = require("discord.js");

//a way for staff to assign/remove roles
module.exports = {
	data: new SlashCommandBuilder()
		.setName('demote')
		.addUserOption(option => option
			.setName('user')
			.setDescription('Mention a user')
			.setRequired(true))
		.addRoleOption(option => option
			.setName('role')
			.setDescription('Mention a role')
			.setRequired(true))
		.setDescription('removes from a user the specified role'),
	execute: async (interaction) => {
		const targetUser = interaction.options.getUser('user');
		const targetRole = interaction.options.getRole('role');

		const targetMember = interaction.guild.members.cache.get(targetUser.id);

		await interaction.guild.members.fetch(interaction.user.id).then(async u => {
			if (targetRole.comparePositionTo(u.roles.highest) > 0 && !u.permissions.has(PermissionsBitField.Flags.Administrator)) {
				await interaction.reply(`<:blobdisapproval:1039016273343951009> You cannot remove a role that is higher than your highest role (Administrators can bypass).`);
			} else {
				await targetMember.roles.remove(targetRole);
				await interaction.reply(`Successfully removed the ${role.name} role from ${member.user.username}`);
			}
		});
	},
};