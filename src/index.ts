import { BaseGuildTextChannel, ChatInputCommandInteraction, Client, GatewayIntentBits, Message, Partials, Snowflake } from 'discord.js';
import fetch from 'node-fetch';
import { Channels, MEE6_API, MEE6_ID, Roles, updateRoleMessage } from './utils';
import { registerCommands } from './registerCommands';
import { Command } from './command';
// import fs from 'fs';

require('dotenv').config();
const topTen: Snowflake[] = [];

type RecentMessage = {
	content: String,
	author: Snowflake,
	time: number
}
let recentMessages: RecentMessage[] = [];

function preprocessMessageForSpam(messageContent: String) {
	return messageContent.toLowerCase().replace(/\s/g, '');
}


function addMessage(messageContent: String, authorID: Snowflake) {
	recentMessages.push({
		content: messageContent,
		author: authorID,
		time: Date.now()
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
	return recentMessages.filter((x) => x.content === messageContent &&
		x.author === authorID).length >= MESSAGE_TIMEOUT_CRITICAL_COUNT;
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

let topTenUpdated: number = -1;

async function updateTopTen() {
	if (topTenUpdated != -1 && Date.now() - topTenUpdated < 60 * 1000) {
		return; //no
	}
	await fetch(
		MEE6_API,
		{
			headers: {
				accept: 'application/json',
			},
			method: 'GET',
		},
	)
		.then((response) => response.json())
		.then((data) => {
			for (let i = 0; i < 10; ++i) {
				topTen[i] = data['players'][i]['id'];
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
		GatewayIntentBits.GuildMembers
	],
	partials: [Partials.Channel],
});

client.on('ready', () => {
	for (const command of commands.values()) {
		command.init(client);
	}

	console.log('zombbblob has awoken');
	process.on('unhandledRejection', (error) => {
		console.error('Unhandled promise rejection:', error);
	});

	if (client.user === null) {
		process.exit(1);
		throw "fix";
	}

	client.user.setPresence({
		activities: [{ name: 'Welcome to EECS281!' }],
		status: 'online',
	});
	const startupChannel = client.channels.cache.get(Channels.zombbblobdev);
	if (!startupChannel) {
		console.error("Startup channel invalid!");
		process.exit(1);
		throw "fix";
	}

	if (startupChannel instanceof BaseGuildTextChannel) {
		startupChannel.send('I have risen again. <:zombbblob:1026136422572372170>');
	} else {
		console.error("Startup channel is not a text channel!");
		process.exit(1);
		throw "fix";
	}
	/* ↓↓↓ ONLY ACTIVE FOR STAR WARS GAME ↓↓↓
	// client.channels.cache.get('1067620211504709656').messages.fetch('1069347684059709532');
	// client.guilds.fetch('734492640216744017').then(g => {
	// 	g.members.fetch(); //Caches all users so we can count how many users have a role later
	// });
	  ↑↑↑ ONLY ACTIVE FOR STAR WARS GAME ↑↑↑ */
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return; //if message is from a bot
	if (message.member === null) return;
	if (isSpam(message.content, message.author.id)) {
		// Spam detector (if same message sent over 10 times in a row)
		const serverLogChannel = client.channels.cache.get(Channels.serverlog);
		if (!serverLogChannel) {
			console.error("server log channel invalid!");
			process.exit(1);
			throw "fix";
		}
	
		if (serverLogChannel instanceof BaseGuildTextChannel) {
			serverLogChannel.send(`<@${message.author.id}> was marked for spamming; timing out for 30 seconds`);
		} else {
			console.error("Startup channel is not a text channel!");
			process.exit(1);
			throw "fix";
		}

		message.member.timeout(30 * 1000); // timeout for 30 seconds
	}
	const words = message.content.toLowerCase().split(' ');
	if (message.content.startsWith('!rank')) { //if person types !rank
		const filter = (m: Message) => m.author.id.toString() === MEE6_ID;
		const collector = message.channel.createMessageCollector({
			filter,
			time: 5000,
			max: 1,
		});
		collector.on('collect', async (m) => {
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
			if (rankQuery === topTen[0]) { //per request of slime
				const arayL = ['<:burgerKingBlobL:1026644796703510599>',
					'🤡',
					'💀',
					'👎',
					'📉',
					'🇱',
					'<:blobL:1023692287185801376>',
					'<:blobsweats:1052600617568317531>',
					'<:notlikeblob:1027966505922592779>',
					'<:blobdisapproval:1039016273343951009>',
					'<:blobyikes:1046967593132630056>',
					'<:blobbruh:936493734592380988>',
					'<:blobRecursive:1026705949605507093>',
					'<:blobEveryone:1026656071856685117>',
					'<:D_:1029092005416009748>'];
				arayL.forEach(async emote => { await m.react(emote); });
			} else if (topTen.includes(rankQuery)) { //if user is in top 10
				m.react('<:blobL:1023692287185801376>'); //react blobL
			} else {
				m.react('<:blobW:1023691935552118945>'); //react blobW
			}
		});
	} //if !rank command
	// else {
	// 	let infectedWord = fs.readFileSync('commands/minigames/zombbblob/infectedWord.txt', 'utf8');
	// 	if (message.content.toLowerCase().search(infectedWord) != -1) { //user says infected word
	// 		//TODO: Make sure to update the role and channel IDs below
	// 		if (!message.member.roles.cache.some((role) => role.id === zombbblobRole)) { //user meets infection criteria
	// 			message.react('<:zombbblob:1026136422572372170>'); //react with :zombbblob:
	// 			message.member.roles.add(zombbblobRole); //add zombbblob role
	// 			client.channels.cache.get('1155211589243375727') //get infected channel
	// 			.send(`<@${message.author.id}> was zombified <:zombbblob:1026136422572372170>\n${message.author.username} was infected by \`${infectedWord}\`\n${message.url}`);
	// 		} //if user is not zombbblob'd
	// 	} //if infection trigger
	// } //if not !rank command
});

client.on('messageReactionAdd', async (reaction, user) => { //Handles Roles.Student/Roles.Student Alumni reaction roles
	if (reaction.message.id === updateRoleMessage) {
		const { guild } = reaction.message; //Extract EECS281 server
		if (guild === null) {
			return;
		}
		await guild.members.fetch(user.id).then(async member => {
			//Reacting to one role should remove the other
			if (reaction.emoji.name === '🧠') { // '\u{0001F9E0}'
				guild.roles.fetch(Roles.StudentAlumni).then(r => { if (r === null) {console.error(`Failed to fetch Student Alumni Role for ${user.id}`); return;} member.roles.remove(r); });
				await guild.roles.fetch(Roles.Student).then(r => { if (r === null) {console.error(`Failed to fetch Student Role for ${user.id}`); return;} member.roles.add(r); });
			} else { //reaction.emoji.name === '🎓'
				guild.roles.fetch(Roles.Student).then(r => { if (r === null) {console.error(`Failed to fetch Student Role for ${user.id}`); return;} member.roles.remove(r); });
				await guild.roles.fetch(Roles.StudentAlumni).then(r => { if (r === null) {console.error(`Failed to fetch Student Alumni Role for ${user.id}`); return;} member.roles.add(r); });
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

const commands: Map<String, Command> = new Map();
import { alumnize } from "./commands/alumnize";
commands.set("alumnize", alumnize);
import { archive } from "./commands/archive";
commands.set("archive", archive);
import { assign } from "./commands/assign";
commands.set("assign", assign);
import { create } from "./commands/create";
commands.set("create", create);
import { demote } from "./commands/demote";
commands.set("demote", demote);
import { invite } from "./commands/invite";
commands.set("invite", invite);
import { lock } from "./commands/lock";
commands.set("lock", lock);
import { open } from "./commands/open";
commands.set("open", open);
import { react } from "./commands/react";
commands.set("react", react);
import { reply } from "./commands/reply";
commands.set("reply", reply);
import { send } from "./commands/send";
commands.set("send", send);
import { timeout } from "./commands/timeout";
commands.set("timeout", timeout);
import { unlock } from "./commands/unlock";
commands.set("unlock", unlock);

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	command.execute(interaction);
})

registerCommands().then(() => {
	client.login(process.env.TOKEN);
});
