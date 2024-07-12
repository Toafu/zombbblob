const { PermissionsBitField } = require('discord.js');

const Roles = {
	Student: '926186372572799037',
	StudentAlumni: '748920659626950737',
	Staff: '734552983261675691',
	InfectedZombbblob: '1155211060685582456', // This one can change
	LightMode: '1065432702431526932',
	DarkMode: '1065432906111135784',
	GalacticNews: '1068940763792158720'
};

const Semesters = {
	f: 'Fall',
	s: 'Spring',
	w: 'Winter'
};

export const communicationsPermissions = [
	PermissionsBitField.Flags.SendMessages,
	PermissionsBitField.Flags.SendMessagesInThreads,
	PermissionsBitField.Flags.Connect,
	PermissionsBitField.Flags.Speak
];

export { Roles, Semesters };