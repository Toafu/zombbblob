import { Client, DiscordAPIError } from "discord.js";

import { ConfigHandler } from "../config/config";
const {
	Channels,
	CLIENT_ID,
	Roles,
	SERVER_ID,
	UPDATE_ROLE_MESSAGE_ID,
	MAINTAINER_IDS,
} = ConfigHandler.getInstance().getConfig();

export async function validateInvariants(client: Client) {
    console.log("Checking CLIENT_ID...");

    // This is probably impossible
    if (client.user === null) {
        console.error("client.user is null at ready time!");
        process.exit(1);
    }

    if (client.user.id !== CLIENT_ID) {
        console.error(
            `CLIENT_ID (${CLIENT_ID}) does not match client.user.id ${client.user.id}`
        );
        process.exit(1);
    }

    console.log("Checking SERVER_ID...");
    const guild = await client.guilds
        .fetch(SERVER_ID)
        .then((guild) => guild)
        .catch((_) => null);

    if (guild === null) {
        console.error(`Could not fetch guild with id ${SERVER_ID}`);
        process.exit(1);
    }

    console.log("Checking Roles...");
    for (const [roleName, roleID] of Object.entries(Roles)) {
        const role = await guild.roles.fetch(roleID);

        if (role === null) {
            console.error(`Role "${roleName}" could not be fetched!`);
            process.exit(1);
        }
    }

    console.log("Checking Channels...");
    for (const [channelName, channelID] of Object.entries(Channels)) {
        const channel = await guild.channels.fetch(channelID).catch((_) => null);
        if (channel === null) {
            console.error(`Channel "${channelName}" could not be fetched!`);
            process.exit(1);
        }
    }

    console.log("Validating update-role message...");
    const updateRoleChannel = guild.channels.cache.get(Channels.updaterole);
    if (updateRoleChannel === undefined) {
        console.error("Failed to validate #update-role!");
        process.exit(1);
    }

    if (!updateRoleChannel.isTextBased()) {
        console.error("#update-role is not a text channel!");
        process.exit(1);
    }

    const updateRoleMessage = await updateRoleChannel.messages
        .fetch(UPDATE_ROLE_MESSAGE_ID)
        .catch((_) => null);
    if (updateRoleMessage === null) {
        console.error("Failed to fetch update-role message!");
        process.exit(1);
    }

    console.log("Validating maintainers...");
    for (const maintainerID of MAINTAINER_IDS) {
        try {
            await guild.members.fetch(maintainerID);
        } catch (err) {
            if (!(err instanceof DiscordAPIError)) {
                throw err;
            }

            console.error(`Failed to validate maintainer ${maintainerID}!`);
            process.exit(1);
        }
    }
}