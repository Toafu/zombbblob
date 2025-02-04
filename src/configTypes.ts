export interface Config {
	CLIENT_ID: string;
	SERVER_ID: string;
	MAINTAINER_ID: string;
	UPDATE_ROLE_MESSAGE_ID: string;
	PERMANENT_INVITE_URL: string;
	ZOMBBBLOB_EMOJI_ID: string;

	Roles: Roles;
	Channels: Channels;
};

interface Roles {
	Student: string;
	StudentAlumni: string;
	Staff: string;
	InfectedZombbblob: string; // This one can change
	LightMode: string;
	DarkMode: string;
	GalacticNews: string;
};

interface Channels {
	pianogang: string;
	oldtimers: string;
	smallstudyrooms: string;
	serverlog: string;
	welcomeandrules: string; // use for /invite
	zombbblobdev: string;
	updaterole: string;
	zombbblob: string;
};