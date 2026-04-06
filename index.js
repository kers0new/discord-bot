const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel]
});

// Simple in-memory license store
const licenses = {};

client.once("ready", () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

// Slash command: /panel
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "panel") {
        const embed = new EmbedBuilder()
            .setTitle("🔒 License Panel")
            .setDescription("Use the buttons below to manage your license.")
            .setColor("#ff0000");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("redeem").setLabel("🎟️ Redeem Key").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("stats").setLabel("📊 My Stats").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("reset").setLabel("🔄 Reset HWID").setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

// Button interactions
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;

    if (interaction.customId === "redeem") {
        licenses[userId] = {
            key: "DEMO-" + Math.random().toString(36).substring(2, 10),
            hwid: null,
            expires: "90 days"
        };

        return interaction.reply({ content: "🎟️ Your key has been redeemed!", ephemeral: true });
    }

    if (interaction.customId === "stats") {
        const data = licenses[userId];

        if (!data) {
            return interaction.reply({ content: "❌ You don't have a license yet.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("📊 Your License Stats")
            .addFields(
                { name: "Status", value: "🟢 Active" },
                { name: "Expires", value: data.expires },
                { name: "HWID", value: data.hwid || "*Not bound yet*" },
                { name: "Key", value: data.key }
            )
            .setColor("#00ff00");

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId === "reset") {
        if (!licenses[userId]) {
            return interaction.reply({ content: "❌ No license found.", ephemeral: true });
        }

        licenses[userId].hwid = null;

        return interaction.reply({ content: "🔄 HWID reset successfully.", ephemeral: true });
    }
});

client.login(process.env.TOKEN);
