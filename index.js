const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 10000; // Render default port

// HTTP server bound explicitly to 0.0.0.0 as required by Render
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP server listening on port ${PORT}`);
});

// Discord bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const categoryIds = process.env.CATEGORY_IDS.split(','); // comma-separated category IDs in .env
  const roleId = "1233778160399814726"; // your role ID

  setInterval(async () => {
    for (const categoryId of categoryIds) {
      try {
        const category = await client.channels.fetch(categoryId.trim());
        if (!category || category.type !== ChannelType.GuildCategory) {
          console.error(`❌ Category ${categoryId} not found or not a category`);
          continue;
        }

        category.children.cache.forEach(channel => {
          if (channel.isTextBased()) {
            channel.send(`<@&${roleId}>`).catch(console.error);
          }
        });
      } catch (err) {
        console.error(`Error fetching category ${categoryId}:`, err);
      }
    }
  }, 10000); // every 10 seconds
});

client.on('messageCreate', async (message) => {
  const prefix = '.';
  const allowedUserId = '711970090454876292'; // replace with your Discord user ID

  if (!message.content.startsWith(prefix) || message.author.bot) return;
  if (message.author.id !== allowedUserId) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'createchannels') {
    if (args.length < 3) {
      return message.channel.send(
        '❌ Usage: .createchannels <CATEGORYNAME> <CHANNELNAME> <CHANNELAMOUNT>'
      );
    }

    const categoryName = args.shift();
    const baseChannelName = args.shift();
    const channelAmount = parseInt(args.shift());

    if (isNaN(channelAmount) || channelAmount < 1) {
      return message.channel.send('❌ CHANNELAMOUNT must be a positive number.');
    }

    try {
      // Create category
      const category = await message.guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
      });

      // Create channels under that category
      for (let i = 1; i <= channelAmount; i++) {
        await message.guild.channels.create({
          name: `${baseChannelName}-${i}`,
          type: ChannelType.GuildText,
          parent: category.id,
        });
      }

      message.channel.send(
        `✅ Created category **${categoryName}** with ${channelAmount} channels named **${baseChannelName}-1** to **${baseChannelName}-${channelAmount}**.`
      );
    } catch (error) {
      console.error(error);
      message.channel.send('❌ Failed to create channels.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
