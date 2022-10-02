const fs = require('fs');

module.exports = {
	slash: true,
	name: 'regenerate',
	category: 'zombbblob',
	maxArgs: 0,
	testOnly: true, //so the slash command updates instantly
	description: 'generates a new word',
	callback: async ({ interaction: msgInt }) => {
		let infection = 'test';
		let words = [];
		fs.readFile('words.txt', (err, data) => {
			if (err) throw err;
			const text = data.toString();
			words = text.split('\n');
		});
		infection = words[Math.ceil(Math.random() * 221) - 1];
		msgInt.reply({ content: `The new infection word is ${infection}` });
	},
};