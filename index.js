const fs = require('fs')
const path = require("node:path");
require('dotenv').config()
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");

const prefix = process.env.PREFIX || '!'
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// UPDATED COMMAND HANDLING
client.commands = new Collection()
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log('Jeeves ready for duty!')
})

// UPDATED SLASH LISTENER

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// LEGACY
const cooldowns = new Collection();


client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type !== 'dm') return

  const args = message.content.slice(prefix.length).split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.name)
  const cooldownAmount = (command.cooldown || 3) * 1000

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
    }
  }

  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

  try {
    command.execute(message, args)
  } catch (error) {
    message.reply('There was an error trying to execute that command!')
  }
})

client.login(process.env.TOKEN)
