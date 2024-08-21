import { PermissionsBitField } from 'discord.js';

export const CLIENT_ID = "" // update me
export const SERVER_ID = "734492640216744017"

export const Roles = {
	Student: '926186372572799037',
	StudentAlumni: '748920659626950737',
	Staff: '734552983261675691',
	InfectedZombbblob: '1155211060685582456', // This one can change
	LightMode: '1065432702431526932',
	DarkMode: '1065432906111135784',
	GalacticNews: '1068940763792158720'
};

export const Channels = {
	pianogang: '1023026145169514586',
	oldtimers: '1132162479175241768',
	smallstudyrooms: '734559465168306186',
};

export const Semesters: Map<String, String> = new Map();
Semesters.set('f', 'Fall');
Semesters.set('s', 'Spring');
Semesters.set('w', 'Winter');

export const communicationsPermissions = [
	PermissionsBitField.Flags.SendMessages,
	PermissionsBitField.Flags.SendMessagesInThreads,
	PermissionsBitField.Flags.Connect,
	PermissionsBitField.Flags.Speak
];
