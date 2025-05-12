import { Message, OmitPartialGroupDMChannel } from "discord.js";

import { ConfigHandler } from "../config";
import { ZipGameDatabase } from "./zipgamedb";
import { SqliteError } from "better-sqlite3";
const { Channels } = ConfigHandler.getInstance().getConfig();

const ZIP_REGEX = /^Zip #(\d+) \| (\d+):(\d+) (?:and flawless )?🏁\nWith (\d+|no) backtrack(?:s?) (?:🛑|🟢)\nlnkd\.in\/zip\./u

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

    try {
        ZipGameDatabase.getInstance().addSubmission({
            messageID: message.id, 
            authorID: message.author.id,
            gameNumber: zipNumber, 
            timeSeconds: minutes * 60 + seconds, 
            backtracks: numBacktracks
        });
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