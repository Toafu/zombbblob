const { Client, GatewayIntentBits } = require('discord.js');
const WOK = require('wokcommands');

const topTen = ['140505365669347328', //slime
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
	new WOK({
		client,
		testServers: ['734492640216744017'],
	});
});


client.on('messageCreate', async (message) => {
	if ( (message.content === '!rank')) { //if person types !rank
		const filter = m => (m.author.id.toString() === '159985870458322944');
		const collector = message.channel.createMessageCollector({filter, time: 5000, max: 1});
		collector.on('collect', m => { //collected following MEE6 message
			if ( (topTen.includes(message.author.id.toString())) ) { //if user is in top 10
				m.react('<:blobL:1023692287185801376>'); //react blobL
			} else {
				m.react('<:blobW:1023691935552118945>'); //react blobW
			}
		});
	}
})


client.login(token); //TOKEN ISN'T REAL YET