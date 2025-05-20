import { Message, MessageFlags, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

import { ConfigHandler } from "../config";
import { Result, ZipGameDatabase } from "./zipgamedb";
import { SqliteError } from "better-sqlite3";
const { Channels } = ConfigHandler.getInstance().getConfig();

interface ZipParseOptions {
    regex: RegExp,
    groups: {
        zipNumber: number,
        minutes: number,
        seconds: number,
        backtracks: number | null
    },
    // iff the message contains no backtracks, noBacktracksExpr is in the matching string (group 0)
    noBacktracksExpr?: string 
};

const zipParseOptionsArr: ZipParseOptions[] = [
    {   // Logged-in w/ English
        regex: /^Zip #(\d+) \| (\d+):(\d+) (?:and flawless )? ?🏁\nWith (\d+|no) backtrack(?:s?) (?:🛑|🟢)\nlnkd\.in\/zip\./u,
        groups: {
            zipNumber: 1,
            minutes: 2,
            seconds: 3,
            backtracks: 4
        },
        noBacktracksExpr: "no backtrack"
    },
    {   // Not logged-in
        regex: /^Zip #(\d+)\n(\d+):(\d+) 🏁\nlnkd\.in\/zip\./u,
        groups: {
            zipNumber: 1,
            minutes: 2,
            seconds: 3,
            backtracks: null
        },
    }
]

export function secondsToTimeString(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export const ZIP_RELEASE_TIMESTAMP = 1742281200000;

export function getTodaysZipNumber(): number {
    // Number of days (rounded down) since the start of Zip + 1 
    // because the first day is game #1 and is 0 away from the start of Zip.
    return Math.floor((Date.now()-ZIP_RELEASE_TIMESTAMP) / (1000 * 60 * 60 * 24)) + 1
}

export function parseZipMessage(message: OmitPartialGroupDMChannel<Message<boolean>>): Result | null {
    if (message.channel.id !== Channels.oldtimers) {
        return null;
    }

    for (const zipParseOptions of zipParseOptionsArr) {
        const data = message.content.match(zipParseOptions.regex);
        if (data === null) {
            continue;
        }

        const zipNumber = Number(data[zipParseOptions.groups.zipNumber]);
        const minutes = Number(data[zipParseOptions.groups.minutes]);
        const seconds = Number(data[zipParseOptions.groups.seconds]);
        const numBacktracks = zipParseOptions.groups.backtracks === null 
                                || zipParseOptions.noBacktracksExpr === undefined ? 
                                    null :
                                    data[0].includes(zipParseOptions.noBacktracksExpr) ? 
                                        0 : 
                                        Number(data[zipParseOptions.groups.backtracks]);

        return {
            message_id: message.id, 
            author_id: message.author.id,
            game_number: zipNumber, 
            time_seconds: minutes * 60 + seconds, 
            backtracks: numBacktracks
        };
    }

    return null;
}

export async function zipMessageCreateHandler(
    message: OmitPartialGroupDMChannel<Message<boolean>>
): Promise<void> {
    const parsedData = parseZipMessage(message)
    
    if (parsedData === null) {
        return;
    }

    const todaysZipNumber = getTodaysZipNumber();

    if (parsedData.game_number != todaysZipNumber) {
        await message.reply(
            `I think the current zip number is ${todaysZipNumber}, but you submitted ${parsedData.game_number}... ` +
            "If this is a mistake, please let me know."
        )
        return;
    }

    try {
		const previousAverageStats = ZipGameDatabase.getInstance().getTodaysAverageStats();

        ZipGameDatabase.getInstance().addSubmission(parsedData);
        await message.react("✅");

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

        await message.reply({
            content: "You've already submitted a time for this game, ignoring this submission...",
        });
    }
}

export function zipMessageDeleteHandler(
    message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>
): void {
    ZipGameDatabase.getInstance().removeSubmission(message.id);
}