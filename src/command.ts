import { ChatInputCommandInteraction, Client, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, Snowflake } from "discord.js"

export type Command = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    init: (client: Client<boolean>) => Promise<void> | void,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
    authorizedRoleIDs?: Array<Snowflake>,
}