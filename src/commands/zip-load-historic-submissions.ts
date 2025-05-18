import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from "discord.js";
import { SqliteError } from "better-sqlite3";
import { Command } from "../command";

import { ConfigHandler } from "../config";
import { parseZipMessage, ZIP_RELEASE_TIMESTAMP } from "../games/zipgame";
import { ZipGameDatabase } from "../games/zipgamedb";
const { Channels } = ConfigHandler.getInstance().getConfig();

const ZIP_RELEASE_SNOWFLAKE = unixTimestampToSnowflake(ZIP_RELEASE_TIMESTAMP);

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("zip-load-historic-submissions")
		.setDescription("load historic zip submissions into database"),
	init: () => { },
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const oldTimersChannel = await interaction.guild.channels.fetch(Channels.oldtimers);
		if (oldTimersChannel === null || !oldTimersChannel.isTextBased()) {
			return;
		}

		const deferredReply = await interaction.deferReply({flags: "Ephemeral"});

		let messages = await oldTimersChannel.messages.fetch({
			after: ZIP_RELEASE_SNOWFLAKE
		});

		while (messages.size > 0) {
			await deferredReply.edit(`<t:${Math.floor(Date.now()/1000)}:R> Fetched ${messages.size} messages...`);

			const sortedMessageIDs = [...messages.keys()].sort((a: Snowflake, b: Snowflake) => {
				return BigInt(b) <= BigInt(a) ? 1 : -1;
			});

			for (const messageID of sortedMessageIDs) {
				const message = messages.get(messageID);
				if (message === undefined) {
					return; // satisfy typescript linter
				}

				const parsedData = parseZipMessage(message);

				if (parsedData !== null) {
					try {
						ZipGameDatabase.getInstance().addSubmission(parsedData);
					} catch (error) {
						if (!(error instanceof SqliteError) 
							|| error.code !== "SQLITE_CONSTRAINT_PRIMARYKEY") {
							throw error;
						}
					}
				}
			}

			const mostRecentMessageID = sortedMessageIDs[sortedMessageIDs.length-1];
			if (mostRecentMessageID === undefined) {
				return; // satisfy typescript linter
			}
			
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