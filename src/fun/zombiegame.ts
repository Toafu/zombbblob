import { Message, Client, SendableChannels, Guild, TextChannel } from 'discord.js';
import { ConfigHandler } from "../config/config";
const { Roles, Channels, ZOMBBBLOB_EMOJI_ID } = ConfigHandler.getInstance().getConfig()
import { WordsDatabase } from './zombbblobdb';
import { maintainersPingString } from '../utils';

export async function onClientStartup(guild: Guild, zombbblobDevChannel: TextChannel) {
	const infectedChannel = guild.channels.cache.get(Channels.zombbblob);
	if (!infectedChannel?.isSendable()) {
		console.error("Infected channel is not a text channel!");
		process.exit(1);
	}

	const db = WordsDatabase.getInstance();

	if (db.isGameRunning()) {
		if (db.getAllWords().length === 0) {
			await zombbblobDevChannel.send(
				`${maintainersPingString}, `
				+ "the game is running without any words! Run `/loadwordlist`"
			);
		} else {
			const infectedWord = db.getInfectedWord();
			if (infectedWord === null) {
				await infectedChannel.send("There is no infected word! Run `/reroll`");
			} else {
				await infectedChannel.send(`The infected word is \`${infectedWord}\``);
			}
		}
	}
}

export async function checkInfection(message: Message, bot: Client) {
	if (!message.member || !message.guild) {
		return;
	}
	const db = WordsDatabase.getInstance();
	const infectedWord = db.getInfectedWord();
	if (infectedWord === null) {
		return;
	}
	const clean_message = message.content.toLowerCase()
	if (clean_message.length <= 140 && clean_message.includes(infectedWord)) {
		if (!message.member.roles.cache.some((role) => role.id === Roles.InfectedZombbblob)) {
			const infectedChannel = (await bot.channels.fetch(Channels.zombbblob)) as SendableChannels
			if (!infectedChannel) {
				console.log("Unable to find infected channel")
				return;
			}
			await message.react(ZOMBBBLOB_EMOJI_ID); // React with :zombbblob:
			await message.member.roles.add(Roles.InfectedZombbblob); // Add zombbblob role
			await infectedChannel.send(`<@${message.author.id}> was zombified ${message.guild.emojis.resolve(ZOMBBBLOB_EMOJI_ID)}\n${message.author.username} was infected by \`${infectedWord}\`\n${message.url}`);
			
			// No guard is necessary here.
			// Regardless of word list cardinality, if no infected word, a new one cannot be chosen.
			db.resetLastInfected();
			const word = db.infectRandomWord();
			await infectedChannel.send(`The new infected word is \`${word}\``);
		}
	}
}