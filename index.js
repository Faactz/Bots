const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const channelIDs = process.env.CHANNEL_IDS.split(',')

  setInterval(() => {
    channelIDs.forEach(id => {
      const channel = client.channels.cache.get(id.trim());
      if (channel) {
        channel.send('Ping!');
      } else {
        console.error(`❌ Channel ${id.trim()} not found`);
      }
    });
  }, 10000); // every 10 seconds
});

client.login(process.env.DISCORD_TOKEN);
