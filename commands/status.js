require('dotenv').config()
const { SlashCommandBuilder } = require('discord.js')
const { connection } = require('../helpers/conn')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Player count in HT WoW'),
  async execute (interaction) {
    connection.query('select count(online) from account where online = 1', (error, results, fields) => {
      if (error) {
        console.error(error)
        return interaction.reply('Something went wrong. Ask @MGMT for help.')
      }
      return interaction.reply(
        `Players online: ${Object.values(results[0])[0]}`
      )
    })
  }
}
