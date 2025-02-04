import {
	ActivityType,
	Client,
	GatewayIntentBits,
	Message,
	MessageReaction,
	Partials,
	Snowflake,
} from "discord.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { MEE6_ID } from "./utils";
import { registerCommands } from "./registerCommands";
import { Command } from "./command";
import { checkInfection } from "./zombiegame";

import { ConfigHandler } from "./config";
const {
	Channels,
	CLIENT_ID,
	Roles,
	SERVER_ID,
	UPDATE_ROLE_MESSAGE_ID,
	ZOMBBBLOB_EMOJI_ID,
	MAINTAINER_ID,
} = ConfigHandler.getInstance().getConfig();

import { WordsDatabase } from "./db";

require("dotenv").config();
const topTen: Snowflake[] = [];

type RecentMessage = {
	content: String;
	author: Snowflake;
	time: number;
};
let recentMessages: RecentMessage[] = [];

function preprocessMessageForSpam(messageContent: String) {
	return messageContent.toLowerCase().replace(/\s/g, "");
}

function addMessage(messageContent: String, authorID: Snowflake) {
	recentMessages.push({
		content: messageContent,
		author: authorID,
		time: Date.now(),
	});

	const MESSAGE_TIMEOUT_MAX_COUNT = 100;
	if (recentMessages.length > MESSAGE_TIMEOUT_MAX_COUNT) {
		recentMessages.shift();
	}

	// Send at least some # of messages in this time period (ms)
	const MESSAGE_TIMEOUT_CRITICAL_TIME = 60 * 1000;

	while (Date.now() - recentMessages[0].time > MESSAGE_TIMEOUT_CRITICAL_TIME) {
		recentMessages.shift();
	}
}

function isSpam(messageContent: String, authorID: Snowflake) {
	messageContent = preprocessMessageForSpam(messageContent);
	addMessage(messageContent, authorID);
	// Send at least this number of messages in some time period
	const MESSAGE_TIMEOUT_CRITICAL_COUNT = 10;
	return (
		recentMessages.filter(
			(x) => x.content === messageContent && x.author === authorID
		).length >= MESSAGE_TIMEOUT_CRITICAL_COUNT
	);
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

let topTenUpdated: number = -1;

async function updateTopTen() {
	if (topTenUpdated != -1 && Date.now() - topTenUpdated < 60 * 1000) {
		return; //no
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

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

const commands: Map<String, Command> = new Map();

client.on("ready", async () => {
	console.log("Checking CLIENT_ID...");

	// This is probably impossible
	if (client.user === null) {
		console.error("client.user is null at ready time!");
		process.exit(1);
	}

	if (client.user.id !== CLIENT_ID) {
		console.error(
			`CLIENT_ID (${CLIENT_ID}) does not match client.user.id ${client.user.id}`
		);
		process.exit(1);
	}

	console.log("Checking SERVER_ID...");
	const guild = await client.guilds
		.fetch(SERVER_ID)
		.then((guild) => guild)
		.catch((_) => null);

	if (guild === null) {
		console.error(`Could not fetch guild with id ${SERVER_ID}`);
		process.exit(1);
	}

	console.log("Checking Roles...");
	for (const [roleName, roleID] of Object.entries(Roles)) {
		const role = await guild.roles.fetch(roleID);

		if (role === null) {
			console.error(`Role "${roleName}" could not be fetched!`);
			process.exit(1);
		}
	}

	console.log("Checking Channels...");
	for (const [channelName, channelID] of Object.entries(Channels)) {
		const channel = await guild.channels.fetch(channelID).catch((_) => null);
		if (channel === null) {
			console.error(`Channel "${channelName}" could not be fetched!`);
			process.exit(1);
		}
	}

	console.log("Validating update-role message...");
	const updateRoleChannel = guild.channels.cache.get(Channels.updaterole);
	if (updateRoleChannel === undefined) {
		console.error("Failed to validate #update-role!");
		process.exit(1);
	}

	if (!updateRoleChannel.isTextBased()) {
		console.error("#update-role is not a text channel!");
		process.exit(1);
	}

	const updateRoleMessage = await updateRoleChannel.messages
		.fetch(UPDATE_ROLE_MESSAGE_ID)
		.catch((_) => null);
	if (updateRoleMessage === null) {
		console.error("Failed to fetch update-role message!");
		process.exit(1);
	}

	console.log("Validating zombbblob emoji...");
	const zombbblobEmote = guild.emojis.cache.get(ZOMBBBLOB_EMOJI_ID);
	if (zombbblobEmote === null) {
		console.error("Failed to validate zombbblob emoji!");
		process.exit(1);
	}

	console.log("Validating maintainer...");
	const maintainer = await guild.members.fetch(MAINTAINER_ID);
	if (!maintainer) {
		console.error("Failed to validate maintainer!");
		process.exit(1);
	}

	console.log("Initializing commands...");
	const commandsDirectoryPath = path.join(__dirname, "commands/");
	for (const commandFileName of fs.readdirSync(commandsDirectoryPath)) {
		const { command } = await import(
			path.join(commandsDirectoryPath, commandFileName)
		);
		command.init(client);
		commands.set(command.data.name, command);
	}

	console.log("zombbblob has awoken");
	process.on("unhandledRejection", (error) => {
		console.error("Unhandled promise rejection:", error);
	});

	client.user.setPresence({
		activities: [
			{
				type: ActivityType.Custom,
				name: "custom", // name is exposed through the API but not shown in the client for ActivityType.Custom
				state: "Welcome to EECS281!",
			},
		],
		status: "online",
	});
	const zombbblobDevChannel = client.channels.cache.get(Channels.zombbblobdev);
	if (!zombbblobDevChannel) {
		console.error("Startup channel invalid!");
		process.exit(1);
	}

	if (!zombbblobDevChannel.isTextBased()) {
		console.error("Startup channel is not a text channel!");
		process.exit(1);
	}

	await zombbblobDevChannel.send(`I have risen again. ${zombbblobEmote}`);

	const infectedChannel = guild.channels.cache.get(Channels.zombbblob);
	if (!infectedChannel?.isTextBased()) {
		console.error("Infected channel is not a text channel!");
		process.exit(1);
	}

	const db = WordsDatabase.getInstance();

	if (db.isGameRunning()) {
		if (db.getAllWords().length === 0) {
			await zombbblobDevChannel.send(`<@${MAINTAINER_ID}>, the game is running without any words! Run \`/loadwordlist\``);
		} else {
			const infectedWord = db.getInfectedWord();
			if (infectedWord === null) {
				await infectedChannel.send("There is no infected word! Run `/reroll`");
			} else {
				await infectedChannel.send(`The infected word is \`${infectedWord}\``);
			}
		}
	}

	/* ↓↓↓ ONLY ACTIVE FOR STAR WARS GAME ↓↓↓
	client.channels.cache.get('1067620211504709656').messages.fetch('1069347684059709532');
	client.guilds.fetch('734492640216744017').then(g => {
		g.members.fetch(); //Caches all users so we can count how many users have a role later
	});
	   ↑↑↑ ONLY ACTIVE FOR STAR WARS GAME ↑↑↑ */
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return; //if message is from a bot
	if (message.member === null) return;
	if (isSpam(message.content, message.author.id)) {
		// Spam detector (if same message sent over 10 times in a row)
		const serverLogChannel = client.channels.cache.get(Channels.serverlog);
		if (!serverLogChannel) {
			console.error("server log channel invalid!");
			process.exit(1);
		}

		if (!serverLogChannel.isTextBased()) {
			console.error("Server log channel is not a text channel!");
			return;
		}

		await serverLogChannel.send(
			`<@${message.author.id}> was marked for spamming; timing out for 30 seconds`
		);
		await message.member.timeout(30 * 1000); // timeout for 30 seconds
	}
	if (WordsDatabase.getInstance().isGameRunning()) {
		await checkInfection(message, client);
	}
	const words = message.content.toLowerCase().split(" ");
	if (message.content.startsWith("!rank")) {
		//if person types !rank
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
});

client.on("messageReactionAdd", async (potentiallyPartialReaction, user) => {
	//Handles Roles.Student/Roles.Student Alumni reaction roles
	let reaction: MessageReaction;

	if (potentiallyPartialReaction.partial) {
		const reactionFetch = await potentiallyPartialReaction
			.fetch()
			.catch((_) => null);
		if (reactionFetch === null) {
			return;
		}
		reaction = reactionFetch;
	} else {
		reaction = potentiallyPartialReaction;
	}

	if (reaction.message.id === UPDATE_ROLE_MESSAGE_ID) {
		const { guild } = reaction.message; //Extract EECS281 server
		if (guild === null) {
			return;
		}
		await guild.members.fetch(user.id).then(async (member) => {
			//Reacting to one role should remove the other
			if (reaction.emoji.name === "🧠") {
				// '\u{0001F9E0}'
				await guild.roles.fetch(Roles.Student).then((r) => {
					if (r === null) {
						console.error(`Failed to fetch Student Role for ${user.id}`);
						return;
					}
					return member.roles.add(r);
				});
				await guild.roles.fetch(Roles.StudentAlumni).then((r) => {
					if (r === null) {
						console.error(`Failed to fetch Student Alumni Role for ${user.id}`);
						return;
					}
					return member.roles.remove(r);
				});
			} else {
				//fullReaction.emoji.name === '🎓'
				await guild.roles.fetch(Roles.StudentAlumni).then((r) => {
					if (r === null) {
						console.error(`Failed to fetch Student Alumni Role for ${user.id}`);
						return;
					}
					return member.roles.add(r);
				});
				await guild.roles.fetch(Roles.Student).then((r) => {
					if (r === null) {
						console.error(`Failed to fetch Student Role for ${user.id}`);
						return;
					}
					return member.roles.remove(r);
				});
			}
		});
	} //if reaction is added to reaction role message
	// ↓↓↓ ONLY ACTIVE FOR STAR WARS GAME ↓↓↓
	// else if (reaction.message.id === '1069347684059709532') {
	// 	const { guild } = reaction.message; //Extract EECS281 server
	// 	await guild.members.fetch(user.id).then(async member => {
	// 		await guild.roles.fetch(galacticNews).then(r => { member.roles.add(r); });
	// 	});
	// }
	// ↑↑↑ ONLY ACTIVE FOR STAR WARS GAME ↑↑↑
});

// ↓↓↓ ONLY ACTIVE FOR STAR WARS GAME ↓↓↓
// client.on('messageReactionRemove', async (reaction, user) => {
// 	if (reaction.message.id === '1069347684059709532') {
// 		const { guild } = reaction.message; //Extract EECS281 server
// 		await guild.members.fetch(user.id).then(async member => {
// 			await guild.roles.fetch(galacticNews).then(r => { member.roles.remove(r); });
// 		});
// 	}
// });
// ↑↑↑ ONLY ACTIVE FOR STAR WARS GAME ↑↑↑

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}
	const command = commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	return command.execute(interaction);
});

(async function () {
	if (process.argv.length <= 2 || process.argv[2] !== "-n") {
		await registerCommands();
	}
	return client.login(process.env.TOKEN);
})();
