const fs = require('fs');
let words = [];
fs.readFile('commands/zombbblob/words.txt', (err, data) => {
	if (err) throw err;
	const text = data.toString();
	words = text.split('\n');
});
let index;

module.exports = {
	slash: true,
	name: 'regenerate',
	category: 'zombbblob',
	maxArgs: 0,
	description: 'generates a new word',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ interaction: msgInt }) => {
		index = Math.ceil(Math.random() * words.length) - 1;
		await msgInt.reply(`The new infection word is \`${words[index]}\``);
		fs.writeFile('commands/zombbblob/infectedWord.txt', words[index], (err) => {
			if (err) throw err;
		})
	},
};

exports.regen = words[index];
