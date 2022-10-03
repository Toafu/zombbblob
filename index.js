const { Client, GatewayIntentBits, Partials } = require('discord.js');
const WOK = require('wokcommands');
const path = require("path");
const fs = require('fs');
require('dotenv').config();

const topTen = [
	'140505365669347328', //slime
	'267813494949150721', //brian
	'485284869841092623', //nikhil
	'734971051037032569', //amadeus
	'731640258399305749', //daniel
	'270054605960773643', //ian smith
	'438790451500285953', //harrison
	'269910487133716480', //toafu
	'143534297674940418', //gavin
	'752750967862198439', //pbb
	//'383714960498229250', //iamr
];

const infectedChannels = [
	'1008983306374754344', //general
	'1008983311680544879', //random
	'928132642308759563', //cs-general
	'1023026145169514586', //piano-gang
	'1024801253257130005', //zombbblob FOR DEBUGGING PURPOSES
];

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Channel],
});

client.on('ready', () => {
	console.log("zombbblob has awoken");
	new WOK(client, {
		testServers: ['734492640216744017'],
		commandsDir: path.join(__dirname, 'commands'),
		disabledDefaultCommands: [
			"channelcommand",
			"customcommand",
			"delcustomcommand",
			"prefix",
			"requiredpermissions",
			"requiredroles",
			"togglecommand",
		],
	});
	process.on('unhandledRejection', error => {
		console.error('Unhandled promise rejection:', error);
	});
	client.user.setPresence({ activities: [{ name: 'Dawn of the Outbbbreak' }], status: 'online' });
});

client.on('messageCreate', async (message) => {
	let infectedWord = fs.readFileSync('infectedWord.txt', 'utf8');
	const words = message.content.toLowerCase().split(' ');
	if ((message.content.startsWith('!rank'))) { //if person types !rank
		const filter = m => (m.author.id.toString() === '159985870458322944');
		const collector = message.channel.createMessageCollector({ filter, time: 5000, max: 1 });
		collector.on('collect', async (m) => { //collected following MEE6 message
			let rankQuery = message.author.id.toString();
			if (words.length > 1) { //assumes user is querying another user
				if (words[1].match(/\d+/)) {
					rankQuery = words[1].match(/\d+/)[0];
				}
			}
			if ((topTen.includes(rankQuery))) { //if user is in top 10
				m.react('<:blobL:1023692287185801376>'); //react blobL
			} else {
				m.react('<:blobW:1023691935552118945>'); //react blobW
			}
			if (rankQuery === topTen[0]) { //per request of slime
				await m.react('🤡');
				await m.react('💀');
				await m.react('👎');
			}
		});
	} //if !rank
	else {
		if (infectedChannels.includes(message.channelId)) { //user says not !rank in a valid channel
			if (message.content.toLowerCase().search(infectedWord) != -1) { //user says infected word
				if (!message.member.roles.cache.some(role => role.name === 'zombbblob')) { //user meets infection criteria
					message.react('<:zombbblob:1026136422572372170>'); //react with :zombbblob:
					message.member.roles.add('1024787443951611974'); //add zombbblob role
				} //if user is not zombbblob'd
			} //if infection trigger
		} // if ~!rank
	}
});

client.login(process.env.TOKEN);
