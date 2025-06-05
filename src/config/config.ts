require('dotenv').config();

import { Config } from "./configTypes";
import * as path from "path";

const devConfig: Config = {
	CLIENT_ID: "1276685924822024326",
	SERVER_ID: "1325691299713777684",
	MAINTAINER_IDS: ["269910487133716480", "1032320122460839997"],
	UPDATE_ROLE_MESSAGE_ID: "1377814011633991773",
	PERMANENT_INVITE_URL: "discord.gg/ZxfHgtBZvp",
	ZOMBBBLOB_EMOJI_ID: '1332929961300066445',
	ZOMBBBLOB_DB_PATH: path.join(__dirname, "../../", "zombbblob-minigame.db"),
	PREVIOUS_COMMANDS_PATH: path.join(__dirname, "../../", "previousCommands.hash"),
	ZIPGAME_DB_PATH: path.join(__dirname, "../../", "zip-game.db"),

	Roles: {
		Student: "1377812169948921949",
		StudentAlumni: "1377812168711475362",
		Staff: "1377812160490770583",
		InfectedZombbblob: "1377812170854895698", // This one can change
		LightMode: "1377812176605024266",
		DarkMode: "1377812177129570325",
		GalacticNews: "1377812178442260480",
		ExamLocked: "1377812162172555346"
	},

	NAMES_OF_POSSIBLE_ROLES_FOR_STUDENT: ['Student', 'InfectedZombbblob', 'LightMode', 'DarkMode', 'GalacticNews'],

	Channels: {
		pianogang: "1377812353554321409",
		oldtimers: "1377812306653876265",
		smallstudyrooms: "1377812205797376055",
		serverlog: "1377812216174350367",
		welcomeandrules: "1377812228547416094", // use for /invite
		zombbblobdev: "1377812244712128513",
		updaterole: "1377812412748533841",
		zombbblob: "1377812473142575194", // Can change,
		zombbblob_trolling: "1377812297895907439",
		staff_bot_commands: "1377812261170712699",
		category_above_newest_semester: "1377812181122289784",
		server_lock_explanation: "1377812423859503164"
	}
};

const prodConfig: Config = {
	CLIENT_ID: "1025822491689619556",
	SERVER_ID: "734492640216744017",
	MAINTAINER_IDS: ["269910487133716480", "1032320122460839997"],
	UPDATE_ROLE_MESSAGE_ID: "926654292524404817",
	PERMANENT_INVITE_URL: "discord.gg/fnVXyhfh33",
	ZOMBBBLOB_EMOJI_ID: "1026136422572372170",
	ZOMBBBLOB_DB_PATH: path.join(__dirname, "../../prod_data/", "zombbblob-minigame.db"),
	ZIPGAME_DB_PATH: path.join(__dirname, "../../prod_data/", "zip-game.db"),
	PREVIOUS_COMMANDS_PATH: path.join(__dirname, "../../prod_data/", "previousCommands.hash"),

	Roles: {
		Student: '926186372572799037',
		StudentAlumni: '748920659626950737',
		Staff: '734552983261675691',
		InfectedZombbblob: '1336203447900569650', // This one can change
		LightMode: '1065432702431526932',
		DarkMode: '1065432906111135784',
		GalacticNews: '1068940763792158720',
		ExamLocked: '1347341885974249472'
	},

	NAMES_OF_POSSIBLE_ROLES_FOR_STUDENT: ['Student', 'InfectedZombbblob', 'LightMode', 'DarkMode', 'GalacticNews'],

	Channels: {
		pianogang: '1023026145169514586',
		oldtimers: '1132162479175241768',
		smallstudyrooms: '734559465168306186',
		serverlog: '734554759662665909',
		welcomeandrules: '734492640757678083', // use for /invite
		zombbblobdev: '926277044487200798',
		updaterole: '926625772595191859',
		zombbblob: '1336203561738043414',
		zombbblob_trolling: '1031779068116467775',
		staff_bot_commands: '749407788156846162',
		category_above_newest_semester: '1076598856634085446',
		server_lock_explanation: '1348505517328433213'
	}
};

export class ConfigHandler {
	private static instance: ConfigHandler;
	private config: Config;

	private constructor() {
		this.config = process.env.PROD === undefined
		    ? devConfig
		    : prodConfig;
	  }
	
    public static getInstance(): ConfigHandler {
        if (!ConfigHandler.instance) {
            ConfigHandler.instance = new ConfigHandler();
        }

        return ConfigHandler.instance;
    }

    public getConfig(): Config {
        return this.config;
    }
};