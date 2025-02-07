# zombbblob

## A superset of PotatoBot

## PotatoBot Specs

✅ a way for staff to assign/remove roles (it might be easier to use a universal syntax for all roles like "/assign staff" instead of $staff, which is not as efficient  
✅ the ability to create invites with number of uses (e.g., /invite N)  
✅ the ability to create channels for a semester (e.g. /create F22) - the current configured channels are general, labs, project-1, project-2, project-3, project-4, midterm-exam, final-exam, and random (still needs archiving but at least automatically manages permissions)  
✅ the ability to role react to the message in update-role (the message ID is 926654292524404817)  
✅ the ability to autoassign students the alumni role at the end of a semester. Currently, the bot goes through all the users with a student role and assigns them with the alumni role on 1/1 (for all users that joined on or before 12/20 of the previous year), 5/1 (for all users that joined on or before 4/27), and 7/1 (for all users that joined on or before 6/30). However, there's probably a better way to do this (you can also range assign a role using a command like /alumnize student 2021-12-21 2021-12-31  
✅ The automatic portion of this command seems to work at a small scale.  
✅ There should be a command to make PotatoBot send custom messages, but only accessible by staff in the staff chat  
✅ There should be a command to make PotatoBot react to any message, also only accessible by staff in the staff chat  

ulgut and slime are working on a verification feature  

## Development

0. Install Node.js
1. Clone the repo
2. run `npm install`
3. Create a file named `.env` in the project directory
4. Define `TOKEN` with a discord bot token (e.g. `TOKEN=abcdef`)
5. Start the bot

    a. `npm start` to start regularly
    
    b. `npm run withoutRegistering` if you don't want to register changes to commands

## Production (Linux Only)

0. Install Docker and Docker Compose
1. Clone the repo
2. Create a folder named `prod_data` owned by UID 1001 (our docker user)
    ```bash
    mkdir prod_data/ && chown -R 1001:1001 prod_data/
    ```
3. Create a file named `.env` in the project directory
4. Define `TOKEN` with a discord bot token (e.g. `TOKEN=abcdef`)
5. Define `PROD`. The value of the variable does not matter.
6. Run the following command:
    ```bash
    docker compose up -d
    ```