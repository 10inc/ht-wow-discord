require('dotenv').config()
const { SlashCommandBuilder } = require("discord.js");
const mysql = require('mysql')
const crypto = require('crypto')

const connection = mysql.createConnection(`mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}/acore_auth`)


module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register an account in HT WoW")
    .addStringOption((option) =>
      option.setName("username").setDescription("WoW Account username for logging in")
    )
    .addStringOption((option) =>
      option.setName("password").setDescription("WoW Account password for logging in")
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
    const password = interaction.options.getString("password");

    if (!username || !password) return interaction.reply("Missing arguement for registration.");
    let errorMessage = ""
    if (username.length <= 3) errorMessage = "Username must be at least 3 characters long.";
    if (password.length <= 6) errorMessage = "Password must be at least 6 characters long.";
    if (errorMessage) return interaction.reply(errorMessage);

    const toPassword = (username, password) => {
      const hash = crypto.createHash("sha1");
      const data = hash.update(
        `${username.toUpperCase()}:${password.toUpperCase()}`,
        "utf-8"
      );
      return data.digest("hex").toUpperCase();
    };

    connection.query(
      "insert into account (username, sha_pass_hash) values (?, ?)", [username, toPassword(username, password)], (error, results, fields) => {
        if (error) {
          return interaction.reply("Something went wrong when registering.");
        } else {
          interaction.reply("Account created, you may login now.");
        }
      }
    );
  },
};
