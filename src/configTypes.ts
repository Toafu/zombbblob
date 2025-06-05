import { Snowflake } from "discord.js";

export interface Config {
	CLIENT_ID: Snowflake;
	SERVER_ID: Snowflake;
	MAINTAINER_IDS: Snowflake[];
	UPDATE_ROLE_MESSAGE_ID: Snowflake;
	PERMANENT_INVITE_URL: string;
	ZOMBBBLOB_EMOJI_ID: Snowflake;
	ZOMBBBLOB_DB_PATH: string;
	ZIPGAME_DB_PATH: string;
	PREVIOUS_COMMANDS_PATH: string;

	Roles: Roles;
	NAMES_OF_POSSIBLE_ROLES_FOR_STUDENT: Array<keyof Roles>;
	Channels: Channels;
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