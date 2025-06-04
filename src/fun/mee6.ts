import { Message, OmitPartialGroupDMChannel, Snowflake } from "discord.js";
import { MEE6_ID } from "../utils";

import { ConfigHandler } from "../config/config";
const {
    SERVER_ID,
} = ConfigHandler.getInstance().getConfig();

const topTen: Snowflake[] = [];
let topTenUpdated: number = -1;

async function updateTopTen() {
    if (topTenUpdated != -1 && Date.now() - topTenUpdated < 60 * 1000) {
        return;
    }
    await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${SERVER_ID}`, {
        headers: {
            accept: "application/json",
        },
        method: "GET",
    })
        .then((response) => response.json())
        .then((data) => {
            for (let i = 0; i < 10; ++i) {
                topTen[i] = data["players"][i]["id"];
            }
        });
    topTenUpdated = Date.now();
}

// if person types !rank
export async function rankCommandMessageHandler(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    const words = message.content.split(" ");

    const filter = (m: Message) => m.author.id.toString() === MEE6_ID;
    const collector = message.channel.createMessageCollector({
        filter,
        time: 5000,
        max: 1,
    });
    collector.on("collect", async (m) => {
        //collected following MEE6 message
        let rankQuery = message.author.id.toString();
        if (words.length > 1) {
            //assumes user is querying another user
            const regexQuery = words[1].match(/\d+/);
            if (regexQuery) {
                rankQuery = regexQuery[0];
            }
        }
        await updateTopTen();
        if (rankQuery === topTen[0]) {
            //per request of slime
            const arayL = [
                "<:burgerKingBlobL:1026644796703510599>",
                "🤡",
                "💀",
                "👎",
                "📉",
                "🇱",
                "<:blobL:1023692287185801376>",
                "<:blobsweats:1052600617568317531>",
                "<:notlikeblob:1027966505922592779>",
                "<:blobdisapproval:1039016273343951009>",
                "<:blobyikes:1046967593132630056>",
                "<:blobbruh:936493734592380988>",
                "<:blobRecursive:1026705949605507093>",
                "<:blobEveryone:1026656071856685117>",
                "<:D_:1029092005416009748>",
            ];
            arayL.forEach(async (emote) => {
                await m.react(emote);
            });
        } else if (topTen.includes(rankQuery)) {
            //if user is in top 10
            m.react("<:blobL:1023692287185801376>"); //react blobL
        } else {
            m.react("<:blobW:1023691935552118945>"); //react blobW
        }
    });
}