require('dotenv').config()
const { SlashCommandBuilder } = require("discord.js");
const mysql = require('mysql')

const connection = mysql.createConnection(`mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}/acore_auth`)

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Player count in HT WoW"),
  async execute(interaction) {
    connection.query('select count(online) from account where online = 1', (error, results, fields) => {
      if (error) return interaction.reply("Something went wrong.")
      return interaction.reply(
        `Players online: ${Object.values(results[0])[0]}`
      );
    })
  },
};
