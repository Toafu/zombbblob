import { Guild, GuildBasedChannel, InteractionResponse, PermissionOverwriteOptions, PermissionsBitField, PrivateThreadChannel, PublicThreadChannel, Role, Snowflake, TextChannel } from 'discord.js';

import { ConfigHandler } from "./config";
const { Roles, SERVER_ID, NAMES_OF_POSSIBLE_ROLES_FOR_STUDENT } = ConfigHandler.getInstance().getConfig();

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

export async function getPossibleRolesForStudent(guild: Guild) {
	let possibleRolesForStudent: Role[] = [];

	for (const roleName of NAMES_OF_POSSIBLE_ROLES_FOR_STUDENT) {
		const role = await guild.roles.fetch(Roles[roleName]);
		if (role === null) {
			throw new Error(`Failed to fetch ${roleName}`);
		}

		possibleRolesForStudent.push(role);
	}

	return possibleRolesForStudent;
}

export async function applyLockRollPermsToChannel(
	channel: Exclude<GuildBasedChannel, PrivateThreadChannel | PublicThreadChannel>,
	possibleRolesForStudent?: Role[],
) {
	if (possibleRolesForStudent === undefined) {
		possibleRolesForStudent = await getPossibleRolesForStudent(channel.guild);
	}

	if (!possibleRolesForStudent?.some(role => canCommunicate(channel, role))) {
		return;
	}

	const permissionOverwrites: PermissionOverwriteOptions = {
		SendMessages: false,
		SendMessagesInThreads: false,
		AddReactions: false,
		Connect: false,
		Speak: false
	};

	const lockRole = await channel.guild.roles.fetch(Roles.ExamLocked);
	if (lockRole === null) {
		return;
	}

	if (lockRole.name === EXAM_LOCK_ENABLED_ROLE_NAME && !hasLockRollPerms(channel)) {
		await channel.permissionOverwrites.create(Roles.ExamLocked, permissionOverwrites);
	} else if (lockRole.name !== EXAM_LOCK_ENABLED_ROLE_NAME && hasLockRollPerms(channel)) {
		await channel.permissionOverwrites.delete(Roles.ExamLocked);
	}
			
}

export async function applyLockRollPermsToChannels(
	guild: Guild, 
	examLockedRole: Role, 
	serverLockExplanationChannel: TextChannel, 
	deferredReply: InteractionResponse<boolean>
) {
	const possibleRolesForStudent = await getPossibleRolesForStudent(guild);

	for (const channel of (await guild.channels.fetch()).values()) {
		if (channel === null) {
			continue;
		}

		try {
			console.log("Processing " + channel.name);
			await applyLockRollPermsToChannel(channel, possibleRolesForStudent);
		} catch (e) {
			console.error(e);
			await deferredReply.edit(`Failed to set permissions for <#${channel.id}>... Terminating...`);
			return;
		}
	}

	if (!serverLockExplanationChannel.permissionOverwrites.cache.get(SERVER_ID)?.deny?.has('ViewChannel')) {
		await serverLockExplanationChannel.permissionOverwrites.create(SERVER_ID, {ViewChannel: false});
	}

	if (examLockedRole.name === EXAM_LOCK_ENABLED_ROLE_NAME) {
		await serverLockExplanationChannel.permissionOverwrites.create(examLockedRole, {ViewChannel: true});
	} else {
		await serverLockExplanationChannel.permissionOverwrites.delete(examLockedRole);
	}
}

function canViewChannel(channel: Exclude<GuildBasedChannel, PrivateThreadChannel | PublicThreadChannel>, role: Role) {
	// (@everyone is not prevented from seeing channel OR <role> can explicitly see the channel) AND (<role> is not prevented from seeing channel)
	return (!channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id)?.deny?.has('ViewChannel')
				|| channel.permissionOverwrites.cache.get(role.id)?.allow?.has('ViewChannel'))
			&& !channel.permissionOverwrites.cache.get(role.id)?.deny?.has('ViewChannel');
}

export function canCommunicate(channel: Exclude<GuildBasedChannel, PrivateThreadChannel | PublicThreadChannel>, role: Role) {
	if (!canViewChannel(channel, role)) {
		return false;
	}
	
	const deniedPermissions = channel.permissionOverwrites.cache.get(role.id)?.deny;

	if (deniedPermissions === undefined) {
		return true;
	}

	if (channel.isVoiceBased()) {
		return !deniedPermissions.has('Connect') && !deniedPermissions.has('Speak');
	}

	if (channel.isTextBased()) {
		return !deniedPermissions.has('SendMessages') && !deniedPermissions.has('SendMessagesInThreads');
	}
}

export function hasLockRollPerms(channel: Exclude<GuildBasedChannel, PrivateThreadChannel | PublicThreadChannel>) {
	const deniedPermissions = channel.permissionOverwrites.cache.get(Roles.ExamLocked)?.deny;

	if (channel.isVoiceBased())
		return deniedPermissions !== undefined && deniedPermissions.has('Connect') && deniedPermissions.has('Speak');
	if (channel.isTextBased())
		return deniedPermissions !== undefined && deniedPermissions.has('SendMessages') && deniedPermissions.has('SendMessagesInThreads')

	return true;
}

export const EXAM_LOCK_ENABLED_ROLE_NAME = "Exam Lock Enabled";
export const EXAM_LOCK_DISABLED_ROLE_NAME = "Exam Lock Disabled";