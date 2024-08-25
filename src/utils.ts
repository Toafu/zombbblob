import { PermissionsBitField, Snowflake } from 'discord.js';

export const CLIENT_ID = "1025822491689619556" // update me
export const SERVER_ID = "734492640216744017"
export const MEE6_ID = '159985870458322944';
export const UPDATE_ROLE_MESSAGE_ID = '1277337909623652436';

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
	serverlog: '734554759662665909',
	welcomeandrules: '734492640757678083', // use for /invite
	zombbblobdev: '926277044487200798',
	updaterole: '926625772595191859'
};

const Semesters: Map<String, String> = new Map();
Semesters.set('f', 'Fall');
Semesters.set('s', 'Spring');
Semesters.set('w', 'Winter');
export function semesterStringToCategoryName(semesterString: string): [Error | null, string] {
	if (!/[fsw]\d{2}/.test(semesterString)) {
		return [new Error('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`'), ''];
	}
	
	const year = semesterString.slice(1).padStart(4, '20'); //Remove first character, pad YY into YYYY
	return [null, `${Semesters.get(semesterString[0])} ${year}`];
}

export const communicationsPermissions = [
	PermissionsBitField.Flags.SendMessages,
	PermissionsBitField.Flags.SendMessagesInThreads,
	PermissionsBitField.Flags.Connect,
	PermissionsBitField.Flags.Speak
];

type DecodedMessageLink = {
	guildID: Snowflake,
	channelID: Snowflake,
	messageID: Snowflake
}

const MESSAGE_LINK_REGEX = /^https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/;
export function parseMessageLink(messageLink: string): [Error | null, DecodedMessageLink] {
	const messageLinkParts = messageLink.match(MESSAGE_LINK_REGEX);
	
	if (messageLinkParts === null) {
		return [new Error("Please make sure you are providing a valid message link."), {guildID: "0", channelID: "0", messageID: "0"}];
	}

	return [null, {
		guildID: messageLinkParts[1],
		channelID: messageLinkParts[2],
		messageID: messageLinkParts[3]
	}];
}