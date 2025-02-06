require('dotenv').config();

import { Config } from "./configTypes";
import * as path from "path";

const devConfig: Config = {
	CLIENT_ID: "1276685924822024326",
	SERVER_ID: "1325691299713777684",
	MAINTAINER_ID: "269910487133716480",
	UPDATE_ROLE_MESSAGE_ID: "1325692036539744256",
	PERMANENT_INVITE_URL: "discord.gg/ZxfHgtBZvp",
	ZOMBBBLOB_EMOJI_ID: '1332929961300066445',
	DB_PATH: path.join(__dirname, "../", "zombbblob-minigame.db"),

	Roles: {
		Student: "1325692142865223732",
		StudentAlumni: "1325692165501747221",
		Staff: "1325692186725056534",
		InfectedZombbblob: "1325692190512644117", // This one can change
		LightMode: "1325692192613994600",
		DarkMode: "1325692206748532799",
		GalacticNews: "1325692269164236831"
	},

	Channels: {
		pianogang: "1325692447749177344",
		oldtimers: "1325692497741221929",
		smallstudyrooms: "1325691789981646900",
		serverlog: "1325691838941626421",
		welcomeandrules: "1325692579651518464", // use for /invite
		zombbblobdev: "1325692710828511302",
		updaterole: "1325692003471589387",
		zombbblob: "1331472882236133439" // Can change
	}
};

const prodConfig: Config = {
	CLIENT_ID: "1025822491689619556",
	SERVER_ID: "734492640216744017",
	MAINTAINER_ID: "269910487133716480",
	UPDATE_ROLE_MESSAGE_ID: "926654292524404817",
	PERMANENT_INVITE_URL: "discord.gg/fnVXyhfh33",
	ZOMBBBLOB_EMOJI_ID: "1026136422572372170",
	DB_PATH: path.join(__dirname, "../prod_data/", "zombbblob-minigame.db"),

	Roles: {
		Student: '926186372572799037',
		StudentAlumni: '748920659626950737',
		Staff: '734552983261675691',
		InfectedZombbblob: '1336203447900569650', // This one can change
		LightMode: '1065432702431526932',
		DarkMode: '1065432906111135784',
		GalacticNews: '1068940763792158720'
	},

	Channels: {
		pianogang: '1023026145169514586',
		oldtimers: '1132162479175241768',
		smallstudyrooms: '734559465168306186',
		serverlog: '734554759662665909',
		welcomeandrules: '734492640757678083', // use for /invite
		zombbblobdev: '926277044487200798',
		updaterole: '926625772595191859',
		zombbblob: '1336203561738043414'
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