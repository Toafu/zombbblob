const { lightMode, darkMode } = require('./join');
const fs = require('fs');
const { WebSocketShardEvents, EmbedBuilder } = require('discord.js');

module.exports = {
	slash: true,
	name: 'battle',
	category: 'potatobot',
	maxArgs: 0,
	description: 'Rally the troops!',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		const lightLocations = [];
		const darkLocations = [];
		fs.readFile('locations.txt', (err, data) => {
			if (err) throw err;
			const text = data.toString();
			words = text.split(/[\n\t\r]+/);
			for (let lightIndex = 0; lightIndex < Number(words[0]); ++lightIndex) {
				lightLocations.push(words[lightIndex + 1]);
			}
			words.splice(0, Number(words[0]) + 1);
			for (let darkIndex = 0; darkIndex < Number(words[0]); ++darkIndex) {
				darkLocations.push(words[darkIndex + 1]);
			}
			const lightRemaining = (lightLocations.length != 1) ?
				` You currently have **${lightLocations.length}** objectives to defend!` : 'This is your __**last base**__! Lose this base and you lose the game!';
			const darkRemaining = (darkLocations.length != 1) ?
				` You currently have **${darkLocations.length}** objectives to defend!` : 'This is your __**last base**__! Lose this base and you lose the game!';
			const embed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('It is time for battle!')
				.setDescription('Your objective is to destroy all of the enemy\'s bases.\n'
					+ 'Select ⚔️ to attack the enemy\'s base and 🛡️ to defend your own.\n'
					+ '**You cannot change your choice once you select!**')
				.addFields(
					{ name: 'Light Mode', value: `__**${lightLocations[lightLocations.length - 1]}**__ is under attack!` + lightRemaining },
					{ name: 'Dark Mode', value: `__**${darkLocations[darkLocations.length - 1]}**__ is under attack!` + darkRemaining }
				);
			msgInt.reply({ embeds: [embed], content: `Insert ping here` });
		});
	}
};
