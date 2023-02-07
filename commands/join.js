require('dotenv').config()
const { SlashCommandBuilder } = require('discord.js')
const crypto = require('crypto')
const { connection } = require('../helpers/conn')
const { createVerifier, generateSalt } = require('../helpers/hash')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register an account in HT WoW')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('WoW Account username for logging in')
    )
    .addStringOption((option) =>
      option
        .setName('password')
        .setDescription('WoW Account password for logging in')
    ),
  async execute (interaction) {
    const username = interaction.options.getString('username')
    const password = interaction.options.getString('password')

    if (!username || !password) { return interaction.reply('Missing arguement for registration.') }
    let errorMessage = ''
    if (username.length < 3) { errorMessage = 'Username must be at least 3 characters long.' }
    if (password.length < 6 && password.length > 21 ) { errorMessage = 'Password must be 6-20 characters long.' }
    if (errorMessage) return interaction.reply(errorMessage)

    const salt = generateSalt()
    const verifier = createVerifier(username, password, salt)

    connection.query(
      'insert into account (username, salt, verifier) values (?, ?, ?)',
      [username, salt, verifier],
      (error, results, fields) => {
        if (error) {
          console.error(error)
          return interaction.reply('Something went wrong when registering. Ask @MGMT for help.')
        } else {
          console.log(`Account created: ${username}`)
          interaction.reply('Account created, you may login now.')
        }
      }
    )
  }
}
