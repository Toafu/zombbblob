import { Message, MessageFlags, OmitPartialGroupDMChannel } from "discord.js";

import { ConfigHandler } from "../config";
import { ZipGameDatabase } from "./zipgamedb";
import { SqliteError } from "better-sqlite3";
const { Channels } = ConfigHandler.getInstance().getConfig();

const ZIP_REGEX = /^Zip #(\d+) \| (\d+):(\d+) (?:and flawless )?🏁\nWith (\d+|no) backtrack(?:s?) (?:🛑|🟢)\nlnkd\.in\/zip\./u

export function secondsToTimeString(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export const ZIP_RELEASE_TIMESTAMP = 1742270399000;

export function getTodaysZipNumber(): number {
    return Math.ceil((Date.now()-ZIP_RELEASE_TIMESTAMP) / (1000 * 60 * 60 * 24))
}

export async function zipMessageHandler(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
    replyOnDuplicateError: boolean = true
): Promise<void> {
    if (message.channel.id !== Channels.oldtimers) {
        return;
    }

    const data = message.content.match(ZIP_REGEX);
    if (data === null) {
        return;
    }

    const zipNumber = Number(data[1]);
    const minutes = Number(data[2]);
    const seconds = Number(data[3]);
    const numBacktracks = data[4] == "no" ? 0 : Number(data[4]);

    const todaysZipNumber = getTodaysZipNumber();

    if (zipNumber != todaysZipNumber) {
        await message.reply(
            `I think the current zip number is ${todaysZipNumber}, but you submitted ${zipNumber}... ` +
            "If this is a mistake, please let me know."
        )
        return;
    }

    const timeSeconds = minutes * 60 + seconds;

    try {
		const previousAverageStats = ZipGameDatabase.getInstance().getTodaysAverageStats();

        ZipGameDatabase.getInstance().addSubmission({
            messageID: message.id, 
            authorID: message.author.id,
            gameNumber: zipNumber, 
            timeSeconds: timeSeconds, 
            backtracks: numBacktracks
        });

        if (previousAverageStats.average_time !== null) {
            const newAverageStats = ZipGameDatabase.getInstance().getTodaysAverageStats();

            if (newAverageStats.average_time === null) { // DB error
                return;
            }

            if (newAverageStats.average_time < previousAverageStats.average_time) {
                await message.reply({
                    content: `You improved today's server average from ${secondsToTimeString(previousAverageStats.average_time)} ` +
                            `to ${secondsToTimeString(newAverageStats.average_time)}!`,
                    flags: MessageFlags.SuppressNotifications
                });
            }
        }
    } catch (error) {
        if (!(error instanceof SqliteError) 
            || error.code !== "SQLITE_CONSTRAINT_PRIMARYKEY") {
            throw error;
        }

        if (replyOnDuplicateError) {
            await message.reply({
                content: "You've already submitted a time for this game, ignoring this submission...",
            });
        }
    }
}