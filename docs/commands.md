# zombbblob Commands Documentation

## Moderation and User Management

### `/assign <user:User> <role:Role>`
Assigns a specified role to a user. Staff cannot assign roles higher than their own (Admins bypass).
- `user`: Target Discord user to receive the role
- `role`: Role to be assigned

### `/demote <user:User> <role:Role>`
Removes a role from a user. Staff cannot remove roles higher than their own (Admins bypass).
- `user`: Target Discord user to lose the role  
- `role`: Role to be removed

### `/timeout <user:User> <timeout_length_in_sec:Number> [reason:String]`
Times out a user for the specified duration.
- `user`: Target Discord user to timeout
- `timeout_length_in_sec`: Duration in seconds for timeout
- `reason` (Optional): Reason for the timeout

## Server Management

### `/alumnize <start_date:String> <end_date:String>`
Assigns students who joined between the specified dates with the Student Alumni role.
- `start_date`: Date in YYYY-MM-DD format when students started joining
- `end_date`: Date in YYYY-MM-DD format when students stopped joining

### `/archive <semester:String>`
Archives the requested channel category by renaming, disabling messages, and removing communication permissions from the Student role.
- `semester`: Semester code, starts with F/S/W followed by last two digits of year (e.g. F22, S23, W23)

### `/create <semester:String>`
Creates a category and channels for a new semester.
- `semester`: Semester code, starts with F/S/W followed by last two digits of year (e.g. F22, S23, W23)

### `/invite [n:Number]`
Creates a Discord invite with optional usage limit.
- `n` (Optional): Number of uses before invite expires

### `/lock`
Locks the server by removing communication permissions from the Student role.

### `/unlock`
Unlocks the server by restoring communication permissions to the Student role.

## zombbblob Game Commands

### `/add-word <word:String>` 
Adds a word to the zombbblob minigame list.
- `word`: Word to add to the game list

### `/remove-word <word:String>`
Removes a word from the zombbblob minigame.
- `word`: Word to remove from the game list

### `/loadwordlist <words_file:Attachment>`
Loads words from a text file. Game must not be running.
- `words_file`: .txt file containing list of words

### `/infected-word`
Shows current infected word during active game.

## Being the Bot

### `/send <channel:TextChannel> <message:String>`
Sends a message as the bot in specified channel.
- `channel`: Target text channel for message
- `message`: Content to send

### `/react <message_link:String> <reaction_emote:String>`
Adds a reaction to specified message.
- `message_link`: Discord message URL to react to
- `reaction_emote`: Emoji/custom emote for reaction

### `/reply <message_link:String> <reply_text:String>`
Replies to specified message as the bot.
- `message_link`: Discord message URL to reply to  
- `reply_text`: Content of the reply
