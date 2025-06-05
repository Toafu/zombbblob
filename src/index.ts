import {
	ActivityType,
	Client,
	GatewayIntentBits,
	GuildChannel,
	GuildMember,
	Message,
	MessageReaction,
	Partials,
	Snowflake,
} from "discord.js";
import fetch from "node-fetch";
import path from "path";
import { applyLockRollPermsToChannel, MEE6_ID, getPossibleRolesForStudent, canCommunicate, maintainersPingString, allFilesInFolderAndSubfolders } from "./utils";
import { registerCommands } from "./command/registerCommands";
import { Command } from "./command/command";
import { checkInfection } from "./fun/zombiegame";
import { zipMessageCreateHandler, zipMessageDeleteHandler } from "./fun/zipgame";
import { rankCommandMessageHandler } from "./fun/mee6";

import { ConfigHandler } from "./config/config";
const {
	Channels,
	Roles,
	SERVER_ID,
	UPDATE_ROLE_MESSAGE_ID,
	ZOMBBBLOB_EMOJI_ID
} = ConfigHandler.getInstance().getConfig();

import { WordsDatabase } from "./fun/zombbblobdb";
import { validateInvariants } from "./config/validator";

require("dotenv").config();

type RecentMessage = {
	content: String;
	author: Snowflake;
	time: number;
};
const recentMessages: RecentMessage[] = [];

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

// Spam detector (if same message sent over 10 times in a row)
async function spamCheck(message: Message) {
	if (isSpam(message.content, message.author.id)) {
		const serverLogChannel = client.channels.cache.get(Channels.serverlog);
		if (!serverLogChannel) {
			console.error("server log channel invalid!");
			process.exit(1);
		}

		if (!serverLogChannel.isSendable()) {
			console.error("Server log channel is not a text channel!");
			return;
		}

		await serverLogChannel.send(
			`<@${message.author.id}> was marked for spamming; timing out for 30 seconds`
		);
		await message.member!.timeout(30 * 1000); // timeout for 30 seconds
	}
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences
	],
	partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});


const commands: Map<String, Command> = new Map();

client.on("ready", async () => {
	await validateInvariants(client);

	console.log("Initializing commands...");
	for (const commandPath of allFilesInFolderAndSubfolders(path.join(__dirname, "commands/"))) {
		const { command } = await import(commandPath);
		command.init(client);
		commands.set(command.data.name, command);
	}

	client.user!.setPresence({
		activities: [
			{
				type: ActivityType.Custom,
				name: "custom", // name is exposed through the API but not shown in the client for ActivityType.Custom
				state: "Welcome to EECS281!",
			},
		],
		status: "online",
	});

	const zombbblobDevChannel = client.channels.cache.get(Channels.zombbblobdev)!;

	if (!zombbblobDevChannel.isSendable()) {
		console.error("Startup channel is not a text channel!");
		process.exit(1);
	}

    const guild = await client.guilds.fetch(SERVER_ID)!;
    const zombbblobEmote = guild.emojis.cache.get(ZOMBBBLOB_EMOJI_ID)!;

	await zombbblobDevChannel.send(`I have risen again. ${zombbblobEmote}`);

	console.log("zombbblob has awoken");
	process.on("unhandledRejection", (error) => {
		console.error("Unhandled promise rejection:", error);
	});

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
	
	await spamCheck(message);

	if (WordsDatabase.getInstance().isGameRunning()) {
		await checkInfection(message, client);
	}
	await zipMessageCreateHandler(message);
	if (message.content.startsWith("!rank")) {
		await rankCommandMessageHandler(message);
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

client.on("messageDelete", async (message) => {
	zipMessageDeleteHandler(message);
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

	if (!interaction.member) {
		console.error("Command called outside of a server!");
		return;
	}

	const member = interaction.member as GuildMember;

	const hasAuthorizedRole = command.authorizedRoleIDs && command.authorizedRoleIDs.some(roleID => member.roles.resolve(roleID));
	if (!member.roles.resolve(Roles.Staff) && !hasAuthorizedRole) {
		await interaction.reply({content: "You are not authorized to use this command!", ephemeral: true});
		return;
	}

	if (command.permittedChannelIDs && !command.permittedChannelIDs.some(channelID => channelID == interaction.channelId)) {
		const plurality = command.permittedChannelIDs.length != 1;
		const channels = command.permittedChannelIDs.map(channelID => `<#${channelID}>`).join('\n');
		await interaction.reply({
			content: `This command can only be used in ${plurality ? 'the following channels: ' : ''}${channels}`
		});
		return;
	}

	return command.execute(interaction);
});

client.on("channelCreate", async (channel) => {
	if (channel.guild === null) {
		return;
	}

	await applyLockRollPermsToChannel(channel);
});

client.on("channelUpdate", async (oldChannel, newChannel) => {
	if (newChannel.isDMBased()) {
		return;
	}
	
	const possibleRolesForStudent = await getPossibleRolesForStudent(newChannel.guild);
	if (!(possibleRolesForStudent).some(role => canCommunicate(newChannel, role))) {
		await newChannel.permissionOverwrites.delete(Roles.ExamLocked);
		return;
	}

	await applyLockRollPermsToChannel(newChannel, possibleRolesForStudent);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
	if (oldMember.roles.resolve(Roles.Student) && !newMember.roles.resolve(Roles.Student)) {
		await newMember.roles.remove(Roles.ExamLocked);
	} else if (!oldMember.roles.resolve(Roles.Student) && newMember.roles.resolve(Roles.Student)) {
		await newMember.roles.add(Roles.ExamLocked);
	}
});

(async function () {
	if (process.argv.length <= 2 || process.argv[2] !== "-n") {
		await registerCommands();
	}
	return client.login(process.env.TOKEN);
})();
