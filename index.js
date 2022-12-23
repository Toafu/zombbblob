const { Client, GatewayIntentBits, Partials } = require('discord.js');
const WOK = require('wokcommands');
const path = require('path');
const fetch = require('node-fetch');
// const fs = require('fs'); //Uncomment during zombbblob event

require('dotenv').config();

const topTen = [];
let recentMessages = [];
let topTenUpdated = null;
const studentRole = '926186372572799037'; //Student role
const studentAlumRole = '748920659626950737'; //Student Alumni role
exports.studentRole = studentRole;
exports.studentAlumRole = studentAlumRole;

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function updateTopTen() {
	if (topTenUpdated != null && Date.now() - topTenUpdated < 60 * 1000) {
		return; //no
	}
	await fetch(
		'https://mee6.xyz/api/plugins/levels/leaderboard/734492640216744017',
		{
			headers: {
				accept: 'application/json',
			},
			body: null,
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
	console.log('zombbblob has awoken');
	new WOK(client, {
		testServers: ['734492640216744017'],
		commandsDir: path.join(__dirname, 'commands'),
		disabledDefaultCommands: [
			'channelcommand',
			'customcommand',
			'delcustomcommand',
			'prefix',
			'requiredpermissions',
			'requiredroles',
			'togglecommand',
		],
		botOwners: ['269910487133716480', 	//toafu
			'730205193408479242', 	//ajzhou
		],
	})
		.setDefaultPrefix('z!');
	process.on('unhandledRejection', (error) => {
		console.error('Unhandled promise rejection:', error);
	});
	client.user.setPresence({
		activities: [{ name: 'May Grades Drop Today' }],
		status: 'online',
	});
	client.channels.cache.get('926625772595191859').messages.fetch('926654292524404817');
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return; //if message is from a bot
	//let infectedWord = fs.readFileSync('infectedWord.txt', 'utf8');
	if (recentMessages.length > 100) {
		recentMessages.shift();
	}
	recentMessages.push(message.content);
	if (recentMessages.filter((x) => x === message.content).length === 10) {
		// Spam detector (if same message sent over 10 times in a row)
		client.channels.cache.get('734554759662665909') // server log channel
			.send(`<@${message.author.id}> was marked for spamming; timing out for 30 seconds`);
		message.member.timeout(30 * 1000); // timeout for 30 seconds
		recentMessages = [];
	}
	const words = message.content.toLowerCase().split(' ');
	if (message.content.startsWith('!rank')) { //if person types !rank
		const filter = (m) => m.author.id.toString() === '159985870458322944';
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
				if (words[1].match(/\d+/)) {
					rankQuery = words[1].match(/\d+/)[0];
				}
			}
			await updateTopTen();
			if (rankQuery === topTen[0]) { //per request of slime
				await m.react('<:burgerKingBlobL:1026644796703510599>');
				await m.react('🤡');
				await m.react('💀');
				await m.react('👎');
				await m.react('📉');
				await m.react('🇱');
				await m.react('<:blobL:1023692287185801376>');
				await m.react('<:blobsweats:1052600617568317531>');
				await m.react('<:notlikeblob:1027966505922592779>');
				await m.react('<:blobdisapproval:1039016273343951009>');
				await m.react('<:blobyikes:1046967593132630056>');
				await m.react('<:blobbruh:936493734592380988>');
				await m.react('<:blobRecursive:1026705949605507093>');
				await m.react('<:blobEveryone:1026656071856685117>');
				await m.react('<:D_:1029092005416009748>');
			} else if (topTen.includes(rankQuery)) { //if user is in top 10
				m.react('<:blobL:1023692287185801376>'); //react blobL
			} else {
				m.react('<:blobW:1023691935552118945>'); //react blobW
			}
		});
	} //if !rank command
	/*
	else {
		message.content = message.content.toLowerCase();
		if (message.content.toLowerCase().search(infectedWord) != -1) { //user says infected word
			//TODO: Make sure to update the role and channel IDs below
			if (!message.member.roles.cache.some((role) => role.id === '1024787443951611974')) { //user meets infection criteria
				message.react('<:zombbblob:1026136422572372170>'); //react with :zombbblob:
				message.member.roles.add('1024787443951611974'); //add zombbblob role
				client.channels.cache.get('1024801253257130005') //get infected channel
				.send(`<@${message.author.id}> was zombified <:zombbblob:1026136422572372170>\n${message.author.username} was infected by \`${infectedWord}\`\n${message.url}`);
			} //if user is not zombbblob'd
		} //if infection trigger
		
		Automatically reply to a message when it includes key phrases
		if (message.channel.id === '1055562256705929288') { //#final-exam in Winter 2023
			if ((message.content.includes("exam") || message.content.includes("grades") || message.content.includes("graded") || message.content.includes("scores"))
			 && (message.content.includes("when are") || message.content.includes("when will"))) {
				message.reply("We are currently waiting for grades to be published! <:blobsleepless:966863492831391754>");
			}
		}
	} // if not !rank command
	*/
});

client.on('messageReactionAdd', async (reaction, user) => { //Handles Student/Student Alumni reaction roles
	if (reaction.message.id === '926654292524404817') {
		const { guild } = reaction.message; //Extract EECS281 server
		await guild.members.fetch(user.id).then(async member => {
			//Reacting to one role should remove the other
			if (reaction.emoji.name === '🧠') { // '\u{0001F9E0}'
				guild.roles.fetch(studentAlumRole).then(r => { member.roles.remove(r); });
				await guild.roles.fetch(studentRole).then(r => { member.roles.add(r); });
			} else { //reaction.emoji.name === '🎓'
				guild.roles.fetch(studentRole).then(r => { member.roles.remove(r); });
				await guild.roles.fetch(studentAlumRole).then(r => { member.roles.add(r); });
			}
		});
	} //if reaction is added to reaction role message
});

client.login(process.env.TOKEN);
