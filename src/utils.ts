import { GuildBasedChannel, PermissionsBitField, PrivateThreadChannel, PublicThreadChannel, Snowflake } from 'discord.js';

import { ConfigHandler } from "./config";
const { Roles } = ConfigHandler.getInstance().getConfig();

export const MEE6_ID = '159985870458322944';

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

// Any character that is not a punctuation, symbol, number, or letter (in any language)
export const INVALID_ZOMBBBLOB_WORD_REGEX = /[^\p{P}\p{S}\p{N}\p{L}]/u;

export const addLockRollPermsToChannel = (
	channel: Exclude<
				GuildBasedChannel, 
				PrivateThreadChannel | PublicThreadChannel
			>
) => channel.permissionOverwrites.create(Roles.ExamLocked, {
		SendMessages: false,
		SendMessagesInThreads: false,
		Connect: false,
		Speak: false
	});

export const EXAM_LOCK_ENABLED_ROLE_NAME = "Exam Lock Enabled";
export const EXAM_LOCK_DISABLED_ROLE_NAME = "Exam Lock Disabled";