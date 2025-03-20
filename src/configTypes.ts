import { Snowflake } from "discord.js";

export interface Config {
	CLIENT_ID: Snowflake;
	SERVER_ID: Snowflake;
	MAINTAINER_ID: Snowflake;
	UPDATE_ROLE_MESSAGE_ID: Snowflake;
	PERMANENT_INVITE_URL: string;
	DB_PATH: string;
	PREVIOUS_COMMANDS_PATH: string;

	Roles: Roles;
	Channels: Channels;
	Emojis: Emojis;
};

interface Roles {
	Student: Snowflake;
	StudentAlumni: Snowflake;
	Staff: Snowflake;
	InfectedZombbblob: Snowflake; // This one can change
	LightMode: Snowflake;
	DarkMode: Snowflake;
	GalacticNews: Snowflake;
	ExamLocked: Snowflake;
};

interface Channels {
	pianogang: Snowflake;
	oldtimers: Snowflake;
	smallstudyrooms: Snowflake;
	serverlog: Snowflake;
	welcomeandrules: Snowflake; // use for /invite
	zombbblobdev: Snowflake;
	updaterole: Snowflake;
	zombbblob: Snowflake;
	zombbblob_trolling: Snowflake;
	staff_bot_commands: Snowflake;
    category_above_newest_semester: Snowflake;
	server_lock_explanation: Snowflake;
};

interface Emojis {
	zombbblob: Snowflake,
	endorsed: Snowflake,
}