require('dotenv').config();

import { Config } from "./configTypes";

const devConfig: Config = {
	CLIENT_ID: "1276685924822024326",
	SERVER_ID: "1032359437207347220",
	UPDATE_ROLE_MESSAGE_ID: "1277337909623652436",

	Roles: {
		Student: "1275587057472770171",
		StudentAlumni: "1275587081120514159",
		Staff: "1275590201808392233",
		InfectedZombbblob: "1275590249065746443", // This one can change
		LightMode: "1275590294481408000",
		DarkMode: "1275590315209654333",
		GalacticNews: "1275590345803038752"
	},

	Channels: {
		pianogang: "1275590124503040015",
		oldtimers: "1275590142803050538",
		smallstudyrooms: "1275589150455889951",
		serverlog: "1275581457762619576",
		welcomeandrules: "1275582059833851926", // use for /invite
		zombbblobdev: "1276519227049644074",
		updaterole: "1277337904041033821",
	}
};

const prodConfig: Config = {
	CLIENT_ID: "1025822491689619556",
	SERVER_ID: "734492640216744017",
	UPDATE_ROLE_MESSAGE_ID: "926654292524404817",

	Roles: {
		Student: '926186372572799037',
		StudentAlumni: '748920659626950737',
		Staff: '734552983261675691',
		InfectedZombbblob: '1155211060685582456', // This one can change
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
		updaterole: '926625772595191859'
	}
};

export class ConfigHandler {
	private static instance: ConfigHandler;
	private config: Config;

	private constructor() {
		this.config = process.env.PROD
		    ? prodConfig
		    : devConfig;
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