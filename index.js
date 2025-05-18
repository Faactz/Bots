const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const categoryIds = process.env.CATEGORY_IDS.split(','); // multiple category IDs separated by commas
  const roleId = "1233778160399814726"; // your role ID

  setInterval(async () => {
    for (const categoryId of categoryIds) {
      try {
        const category = await client.channels.fetch(categoryId.trim());
        if (!category || category.type !== 4) { // 4 = GUILD_CATEGORY
          console.error(`❌ Category ${categoryId} not found or not a category`);
          continue;
        }

        category.children.forEach(channel => {
          if (channel.isText()) {
            channel.send(`<@&${roleId}>`).catch(console.error);
          }
        });
      } catch (err) {
        console.error(`Error fetching category ${categoryId}:`, err);
      }
    }
  }, 10000); // every 10 seconds
});

client.login(process.env.DISCORD_TOKEN);
