const fs = require('fs');
let words = [];
fs.readFile('words.txt', (err, data) => {
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
	callback: async ({ args, interaction: msgInt }) => {
		index = Math.ceil(Math.random() * 222) - 1;
		await msgInt.reply(`The new infection word is \`${words[index]}\``);
	},
};

exports.regen = words[index];
