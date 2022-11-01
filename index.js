const { Client, GatewayIntentBits, Partials } = require('discord.js');
const WOK = require('wokcommands');
const path = require('path');
const fetch = require('node-fetch');
//const fs = require('fs');

require('dotenv').config();

const topTen = [];
let topTenUpdated = null;
const roleStudent = '926186372572799037'; //Student role
const roleStudentAlum = '748920659626950737'; //Student Alumni role

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
		GatewayIntentBits.GuildMessageReactions
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
		activities: [{ name: 'End of the Outbbbreak' }],
		status: 'online',
	});
	client.channels.cache.get('926277044487200798').messages.fetch('1031778422881534033');
	//REAL ONE				  '926625772595191859'				   '926654292524404817'
});

client.on('messageCreate', async (message) => {
	//let infectedWord = fs.readFileSync('infectedWord.txt', 'utf8');
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
			} else if (topTen.includes(rankQuery)) { //if user is in top 10
				m.react('<:blobL:1023692287185801376>'); //react blobL
			} else {
				m.react('<:blobW:1023691935552118945>'); //react blobW
			}
		});
	} //if !rank
	/*
	else {
		if (message.content.toLowerCase().search(infectedWord) != -1) {
			//user says infected word
			if (!message.member.roles.cache.some((role) => role.name === 'zombbblob')) {
				//user meets infection criteria
				message.react('<:zombbblob:1026136422572372170>'); //react with :zombbblob:
				message.member.roles.add('1024787443951611974'); //add zombbblob role
				client.channels.cache.get('1024801253257130005')
				.send(`<@${message.author.id}> was zombified <:zombbblob:1026136422572372170>\n${message.author.username} was infected by \`${infectedWord}\`\n${message.url}`);
			} //if user is not zombbblob'd
		} //if infection trigger
	} // if ~!rank
	*/
});

client.on('messageReactionAdd', async (reaction, user) => { //Handles Student/Student Alumni reaction roles
	if (reaction.message.id === '1031778422881534033') { //THIS IS NOT THE REAL ONE
		const { guild } = reaction.message; //Extract EECS281 server
		await guild.members.fetch(user.id).then(async member => {
			//Reacting to one role should remove the other
			if (reaction.emoji.name === '🧠') { // '\u{0001F9E0}'
				guild.roles.fetch(roleStudentAlum).then(r => { member.roles.remove(r); });
				await guild.roles.fetch(roleStudent).then(r => { member.roles.add(r); });
			} else { //reaction.emoji.name === '🎓'
				guild.roles.fetch(roleStudent).then(r => { member.roles.remove(r); });
				await guild.roles.fetch(roleStudentAlum).then(r => { member.roles.add(r); });
			}
		});
	} //if reaction is added to reaction role message
});

client.login(process.env.TOKEN);
