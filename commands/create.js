const { ChannelType } = require("discord.js");

//the ability to create channels for a semester (e.g. /create F22)
module.exports = {
	slash: true,
	name: 'create',
	category: 'potatobot',
	minArgs: 1,
	maxArgs: 1,
	options: [
		{
		  name: 'semester',
		  description: 'Provide a semester and year formatted like F22',
		  required: true,
		  type: 3,
		}
		//add an optional archive argument (adds ARCHIVED after category name and disables new messages)
	  ],
	expectedArgs: "<[F/S/W][Last two digits of year]>",
	description: 'creates a category for channels of this semester',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, text, interaction: msgInt }) => {
		const semesters = {
			f: 'Fall',
			s: 'Spring',
			w: 'Winter'
		};
		const semester = text.toLowerCase();
		if (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w')) {
			let categoryName = semesters[semester.at(0)];
			let year = semester.slice(1); //Remove first character
			year = year.padStart(4, '20'); //Pads up to 4 character string, so you can technically say 2022
			categoryName = categoryName + ` ${year}`;
			const category = guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory });
			let categoryChannel;
			category.then(c => {categoryChannel = c; c.setPosition(3)});
			const channels = ['general', 'labs', 'random', 'project-1', 'project-2', 'project-3', 'project-4', 'midterm-exam', 'final-exam'];
			for (let i = 0; i < channels.size; ++i) {
				guild.channels.create({ name: channels[i], type: ChannelType.GuildText })
				.then(channel => {channel.setParent(categoryChannel)})
				.catch(console.error);
			}
			msgInt.reply(`${categoryName} successfully created`);
		} else {
			msgInt.reply('Invalid semester format');
		}
	}
};