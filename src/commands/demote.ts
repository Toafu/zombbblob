import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  Role,
  SlashCommandBuilder,
} from 'discord.js';
import {Command} from '../command';

//a way for staff to assign/remove roles
export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('demote')
    .addUserOption(option =>
      option.setName('user').setDescription('Mention a user').setRequired(true),
    )
    .addRoleOption(option =>
      option.setName('role').setDescription('Mention a role').setRequired(true),
    )
    .setDescription('removes from a user the specified role'),
  init: () => {},
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (interaction.guild === null) {
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const targetRole = interaction.options.getRole('role', true) as Role;

    const targetMember = interaction.guild.members.cache.get(targetUser.id);
    if (!targetMember) {
      await interaction.reply('Failed to get target from cache');
      return;
    }

    const interactionMember = await interaction.guild.members.fetch(
      interaction.user.id,
    );
    if (
      targetRole.comparePositionTo(interactionMember.roles.highest) > 0 &&
      !interactionMember.permissions.has(
        PermissionsBitField.Flags.Administrator,
      )
    ) {
      await interaction.reply(
        '<:blobdisapproval:1039016273343951009> You cannot remove a role that is higher than your highest role (Administrators can bypass).',
      );
      return;
    }

    await targetMember.roles.remove(targetRole);
    await interaction.reply(
      `Successfully removed the ${targetRole.name} role from ${targetMember.user.username}`,
    );
  },
};
