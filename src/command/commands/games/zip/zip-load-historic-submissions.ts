import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";
import { SqliteError } from "better-sqlite3";
import { Command } from "../../../command";

import { ConfigHandler } from "../../../../config/config";
import { getTodaysZipNumber, parseZipMessage, ZIP_RELEASE_TIMESTAMP } from "../../../../fun/zipgame";
import { ZipGameDatabase } from "../../../../fun/zipgamedb";
const { Channels } = ConfigHandler.getInstance().getConfig();

const BEFORE_ZIP_RELEASE_SNOWFLAKE = unixTimestampToSnowflake(ZIP_RELEASE_TIMESTAMP-1);

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("zip-load-historic-submissions")
		.setDescription("load historic zip submissions into database")
		.addBooleanOption(option => option
			.setName("react_to_messages")
			.setDescription("whether or not to react with a checkmark to loaded submissions")
		),
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const oldTimersChannel = await interaction.guild.channels.fetch(Channels.oldtimers);
		if (oldTimersChannel === null || !oldTimersChannel.isTextBased()) {
			return;
		}

		const shouldReact = interaction.options.getBoolean("react_to_messages", false) ?? false;

		const deferredReply = await interaction.deferReply({flags: "Ephemeral"});

		let messages = await oldTimersChannel.messages.fetch({
			after: BEFORE_ZIP_RELEASE_SNOWFLAKE
		});

		while (messages.size > 0) {
			await deferredReply.edit(`<t:${Math.floor(Date.now()/1000)}:R> Fetched ${messages.size} messages...`);

			const sortedMessageIDs = [...messages.keys()].sort((a: Snowflake, b: Snowflake) => {
				return BigInt(b) <= BigInt(a) ? 1 : -1;
			});

			for (const messageID of sortedMessageIDs) {
				const message = messages.get(messageID)!;

				const parsedData = parseZipMessage(message);

				if (parsedData !== null && parsedData.game_number <= getTodaysZipNumber()) {
					try {
						if (!ZipGameDatabase.getInstance().isSubmissionRemoved(message.id) &&
							!ZipGameDatabase.getInstance().isDenyListed(message.author.id)) {
							ZipGameDatabase.getInstance().addSubmission(parsedData);
							if (shouldReact) {
								await message.react("✅");
							}
						}
					} catch (error) {
						if (!(error instanceof SqliteError) 
							|| error.code !== "SQLITE_CONSTRAINT_PRIMARYKEY") {
							throw error;
						}
					}
				}
			}

			const mostRecentMessageID = sortedMessageIDs[sortedMessageIDs.length-1]!;
			
			messages = await oldTimersChannel.messages.fetch({
				after: mostRecentMessageID
			});
		}

		await deferredReply.edit("Loaded Zip games!");
	},
};

function unixTimestampToSnowflake(unixTimestampMS: number) {
	const DISCORD_EPOCH = 1420070400000;
	const adjustedTimestamp = unixTimestampMS - DISCORD_EPOCH;
	
	const timestampBits = BigInt(adjustedTimestamp) << 22n;
	
	return timestampBits.toString();
}