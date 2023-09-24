const fs = require('fs');

module.exports = {
	slash: true,
	name: 'current',
	category: 'zombbblob',
	maxArgs: 0,
	description: 'prints the current word',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ interaction: msgInt }) => {
		const infectedWord = fs.readFileSync('commands/zombbblob/infectedWord.txt', 'utf8');
		await msgInt.reply(`The current infection word is \`${infectedWord}\``);
	},
};
