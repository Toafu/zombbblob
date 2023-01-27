const { lightMode, darkMode } = require('../index');
const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	slash: true,
	name: 'battle',
	category: 'potatobot',
	maxArgs: 0,
	description: 'Rally the troops!',
	testOnly: true, //so the slash command updates instantly
	//Assumes command won't be run manually when game ends
	init: (client) => {
		const continueGame = () => {
			client.guilds.fetch('734492640216744017').then(g => {
				g.channels.fetch('1067620211504709656').then(c => {
					const lightLocations = [];
					const darkLocations = [];
					fs.readFile('locations.txt', (err, data) => {
						if (err) throw err;
						const text = data.toString();
						words = text.split(/[\n\t\r]+/);
						if (words[0] == 0) { return; }
						for (let lightIndex = 0; lightIndex < Number(words[0]); ++lightIndex) {
							lightLocations.push(words[lightIndex + 1]);
						}
						words.splice(0, Number(words[0]) + 1);
						if (words[0] == 0) { return; }
						for (let darkIndex = 0; darkIndex < Number(words[0]); ++darkIndex) {
							darkLocations.push(words[darkIndex + 1]);
						}
						const lightRemaining = (lightLocations.length != 1) ?
							` You currently have **${lightLocations.length}** objectives to defend!` : ' This is your __**last base**__! Lose this base and you lose the game!';
						const darkRemaining = (darkLocations.length != 1) ?
							` You currently have **${darkLocations.length}** objectives to defend!` : ' This is your __**last base**__! Lose this base and you lose the game!';
						const embed = new EmbedBuilder()
							.setColor(0xFF0000)
							.setTitle('It is time for battle!')
							.setDescription('Your objective is to destroy all of the enemy\'s bases.\n'
								+ 'Select ⚔️ to attack the enemy\'s base and 🛡️ to defend your own.\n'
								+ 'Defenders get a __**+2**__ defense bonus, so coordinate wisely.\n'
								+ '**You cannot change your choice once you select!**')
							.addFields(
								{ name: 'Light Mode', value: `__**${lightLocations[lightLocations.length - 1]}**__ is under attack!` + lightRemaining },
								{ name: 'Dark Mode', value: `__**${darkLocations[darkLocations.length - 1]}**__ is under attack!` + darkRemaining }
							);
						const atkButton = new ButtonBuilder()
							.setCustomId('ATK')
							.setLabel('Attack!')
							.setEmoji('⚔️')
							.setStyle(ButtonStyle.Danger);
						const defButton = new ButtonBuilder()
							.setCustomId('DEF')
							.setLabel('Defend!')
							.setEmoji('🛡️')
							.setStyle(ButtonStyle.Primary);
						const row = new ActionRowBuilder()
							.addComponents(atkButton, defButton);
						let lightATK = 0;
						let darkATK = 0;
						let lightDEF = 2;
						let darkDEF = 2;
						c.send({
							embeds: [embed],
							content: `Please make your choice <t:${Date.parse(new Date) / 1000 + (0.5 * 60)}:R>`, components: [row]
						}).then(m => { //m is the message sent
							const collector = c.createMessageComponentCollector({ time: 0.5 * 60000 });
							const fighters = new Set();
							collector.on('collect', async i => {
								//Each user only gets one interaction (i)
								if (!fighters.has(i.user.id)) {
									fighters.add(i.user.id);
									//Distinguish between Light and Dark mode user
									if (i.member._roles.some(r => r === lightMode)) {
										if (i.customId == 'ATK') {
											++lightATK;
										} else { //Must be 'DEF'
											++lightDEF;
										}
									} else if (i.member._roles.some(r => r === darkMode)) {
										if (i.customId == 'ATK') {
											++darkATK;
										} else { //Must be 'DEF'
											++darkDEF;
										}
									}
									i.reply({ content: `Your action has been logged.`, ephemeral: true });
								} else {
									i.reply({ content: `You have already taken action >:(`, ephemeral: true });
								}
							});
							collector.on('end', collected => {
								embed.setTitle('Battle Concluded');
								atkButton.setDisabled(true);
								defButton.setDisabled(true);
								embed.addFields({
									name: `Battle Results`,
									value: `Total Light Mode Attack: **${lightATK}**\n`
										+ `Total Light Mode Defense: **${lightDEF}**\n`
										+ `Total Dark Mode Attack: **${darkATK}**\n`
										+ `Total Dark Mode Defense: **${darkDEF}**`
								});
								if (darkATK > lightDEF) { //Successful Dark Mode Attack
									embed.addFields({
										name: `${lightLocations.pop()} Destroyed!`,
										value: `The Light Mode has **${lightLocations.length}** bases left.`
									});
								}
								if (lightATK > darkDEF) { //Successful Light Mode Attack
									embed.addFields({
										name: `${darkLocations.pop()} Destroyed!`,
										value: `The Dark Mode has **${darkLocations.length}** bases left.`
									});
								}
								const endEmbed = new EmbedBuilder()
									.setTitle('War has ended!')
									.setColor(0x00FF5B)
									.setFooter({ text: 'This will be awkward if you both lost...' });
								//TODO: Insert emojis for end of game
								if (lightLocations.length === 0) {
									endEmbed.addFields({
										name: 'Light Mode Defeat!',
										value: 'The Dark Mode have proven themselves as the **superior** mode.'
									});
								}
								if (darkLocations.length === 0) {
									endEmbed.addFields({
										name: 'Dark Mode Defeat!',
										value: 'The Light Mode have proven themselves as the **superior** mode.'
									});
								}
								m.edit({ embeds: [embed], components: [row], content: `` });
								if (lightLocations.length == 0 || darkLocations == 0) {
									c.send({ embeds: [endEmbed] });
								}
								let outstring = `${lightLocations.length}\n`;
								lightLocations.forEach(l => outstring += `${l}\n`);
								outstring += `${darkLocations.length}\n`;
								darkLocations.forEach(l => outstring += `${l}\n`);
								fs.writeFile('locations.txt', outstring, (err) => {
									if (err) throw err;
								});
							});
						});
					});
				});
			});
			const newTime = Math.floor(10 + (Math.random() * 13));
			const d = new Date;
			setTimeout(continueGame, (1000 * 60 * 60) * (24 - d.getHours() + newTime));
		};
		continueGame();
	},
	callback: async ({ channel, interaction: msgInt }) => {
		const lightLocations = [];
		const darkLocations = [];
		// //Input file is of the form
		/*
			numLightLocations
			LightLocation1
			LightLocation2
			...
			numDarkLocations
			DarkLocation1
			DarkLocation2
		*/
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
				` You currently have **${lightLocations.length}** objectives to defend!` : ' This is your __**last base**__! Lose this base and you lose the game!';
			const darkRemaining = (darkLocations.length != 1) ?
				` You currently have **${darkLocations.length}** objectives to defend!` : ' This is your __**last base**__! Lose this base and you lose the game!';
			const embed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('It is time for battle!')
				.setDescription('Your objective is to destroy all of the enemy\'s bases.\n'
					+ 'Select ⚔️ to attack the enemy\'s base and 🛡️ to defend your own.\n'
					+ 'Defenders get a __**+2**__ defense bonus, so coordinate wisely.\n'
					+ '**You cannot change your choice once you select!**')
				.addFields(
					{ name: 'Light Mode', value: `__**${lightLocations[lightLocations.length - 1]}**__ is under attack!` + lightRemaining },
					{ name: 'Dark Mode', value: `__**${darkLocations[darkLocations.length - 1]}**__ is under attack!` + darkRemaining }
				);
			const atkButton = new ButtonBuilder()
				.setCustomId('ATK')
				.setLabel('Attack!')
				.setEmoji('⚔️')
				.setStyle(ButtonStyle.Danger);
			const defButton = new ButtonBuilder()
				.setCustomId('DEF')
				.setLabel('Defend!')
				.setEmoji('🛡️')
				.setStyle(ButtonStyle.Primary);
			const row = new ActionRowBuilder()
				.addComponents(atkButton, defButton);
			let lightATK = 0;
			let darkATK = 0;
			let lightDEF = 2;
			let darkDEF = 2;
			msgInt.reply({
				embeds: [embed],
				content: `Please make your choice <t:${Date.parse(new Date) / 1000 + (0.5 * 60)}:R>`, components: [row]
			});
			const collector = channel.createMessageComponentCollector({ time: 0.5 * 60000 });
			const fighters = new Set();
			collector.on('collect', async i => {
				//Each user only gets one interaction (i)
				if (!fighters.has(i.user.id)) {
					fighters.add(i.user.id);
					//Distinguish between Light and Dark mode user
					if (i.member._roles.some(r => r === lightMode)) {
						if (i.customId == 'ATK') {
							++lightATK;
						} else { //Must be 'DEF'
							++lightDEF;
						}
					} else if (i.member._roles.some(r => r === darkMode)) {
						if (i.customId == 'ATK') {
							++darkATK;
						} else { //Must be 'DEF'
							++darkDEF;
						}
					}
					i.reply({ content: `Your action has been logged.`, ephemeral: true });
				} else {
					i.reply({ content: `You have already taken action >:(`, ephemeral: true });
				}
			});
			collector.on('end', collected => {
				embed.setTitle('Battle Concluded');
				atkButton.setDisabled(true);
				defButton.setDisabled(true);
				embed.addFields({
					name: `Battle Results`,
					value: `Total Light Mode Attack: **${lightATK}**\n`
						+ `Total Light Mode Defense: **${lightDEF}**\n`
						+ `Total Dark Mode Attack: **${darkATK}**\n`
						+ `Total Dark Mode Defense: **${darkDEF}**`
				});
				if (darkATK > lightDEF) { //Successful Dark Mode Attack
					embed.addFields({
						name: `${lightLocations.pop()} Destroyed!`,
						value: `The Light Mode has **${lightLocations.length}** bases left.`
					});
				}
				if (lightATK > darkDEF) { //Successful Light Mode Attack
					embed.addFields({
						name: `${darkLocations.pop()} Destroyed!`,
						value: `The Dark Mode has **${darkLocations.length}** bases left.`
					});
				}
				const endEmbed = new EmbedBuilder()
					.setTitle('War has ended!')
					.setColor(0x00FF5B)
					.setFooter({ text: 'This will be awkward if you both lost...' });
				//TODO: Insert emojis for end of game
				if (lightLocations.length === 0) {
					endEmbed.addFields({
						name: 'Light Mode Defeat!',
						value: 'The Dark Mode have proven themselves as the **superior** mode.'
					});
				}
				if (darkLocations.length === 0) {
					endEmbed.addFields({
						name: 'Dark Mode Defeat!',
						value: 'The Light Mode have proven themselves as the **superior** mode.'
					});
				}
				if (lightLocations.length == 0 || darkLocations == 0) {
					channel.send({ embeds: [endEmbed] });
				}
				let outstring = `${lightLocations.length}\n`;
				lightLocations.forEach(l => outstring += `${l}\n`);
				outstring += `${darkLocations.length}\n`;
				darkLocations.forEach(l => outstring += `${l}\n`);
				fs.writeFile('locations.txt', outstring, (err) => {
					if (err) throw err;
				});
				msgInt.editReply({ embeds: [embed], components: [row], content: `` });
			});
		});
	}
};
