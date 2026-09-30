import 'dotenv/config';
import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  PermissionsBitField
} from 'discord.js';

if (!process.env.DISCORD_TOKEN) throw new Error('Configura DISCORD_TOKEN nell’ambiente del bot.');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const warningActions = ['Avviso 1', 'Avviso 2', 'Avviso 3'];
const redActions = ['Sospensione', 'Depex', 'Licenziamento', 'Auto-Licenziamento'];
const darkRedActions = ['Espulsione', 'Ban Temporaneo', 'Ban permanente'];
const allActions = [...warningActions, ...redActions, ...darkRedActions];
const neverActions = ['Depex', 'Ban permanente'];
const permanentAllowedActions = ['Espulsione', 'Ban Temporaneo', 'Ban permanente'];
const title = 'Utente Sanzionato || N. Controll';

function sanctionColor(action) {
  if (warningActions.includes(action)) return 0xe67e22;
  if (redActions.includes(action)) return 0xed4245;
  return 0x8b0000;
}

function sanctionIcon(action) {
  if (warningActions.includes(action)) return 'https://cdn.discordapp.com/emojis/1547320792881045645.webp?size=40';
  if (['Sospensione', 'Depex'].includes(action)) return 'https://cdn.discordapp.com/emojis/1546459341060841485.webp?size=40';
  if (action === 'Auto-Licenziamento') return 'https://cdn.discordapp.com/emojis/1530889635406942388.webp?size=40';
  if (darkRedActions.includes(action)) return 'https://cdn.discordapp.com/emojis/1546459495696306249.webp?size=40';
  return null;
}

function createSanctionEmbed(user, action, reason, expiryText) {
  const embed = new EmbedBuilder()
    .setColor(sanctionColor(action))
    .setTitle(title)
    .addFields(
      { name: 'Utente', value: `<@${user.id}> (${user.globalName || user.username})`, inline: false },
      { name: 'Azione', value: action, inline: true },
      { name: 'Motivo', value: reason.replaceAll('@', '@\u200b').slice(0, 1000), inline: false },
      { name: 'Scadenza', value: expiryText, inline: true }
    )
    .setTimestamp();
  const iconURL = sanctionIcon(action);
  if (iconURL) embed.setAuthor({ name: title, iconURL });
  return embed;
}

function getExpiryText(action, selectedExpiry) {
  if (action === 'Depex') {
    if (selectedExpiry) throw new Error('Il Depex non scade: lascia vuota la scadenza.');
    return 'Non scade';
  }
  if (action === 'Ban permanente') {
    if (selectedExpiry && selectedExpiry !== 'permanente') {
      throw new Error('Per il Ban permanente lascia vuota la scadenza o scegli Mai (Permanente).');
    }
    return 'Mai (Permanente)';
  }
  if (!selectedExpiry) throw new Error('Seleziona una scadenza da 7 a 30 giorni.');
  if (selectedExpiry === 'permanente') {
    if (!permanentAllowedActions.includes(action)) {
      throw new Error('La scadenza permanente è disponibile solo per Espulsione e Ban.');
    }
    return 'Mai (Permanente)';
  }
  const days = Number(selectedExpiry);
  if (!Number.isInteger(days) || days < 7 || days > 30) {
    throw new Error('La scadenza deve essere compresa tra 7 e 30 giorni.');
  }
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return `<t:${Math.floor(expiresAt.getTime() / 1000)}:F> (tra ${days} giorni)`;
}

client.once('ready', () => console.log(`Online come ${client.user.tag}`));
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'sanziona') return;
  try {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: 'Questo comando è disponibile solo in un server.', ephemeral: true });
    }
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: '❌ Comando riservato allo staff con permesso Gestisci server.', ephemeral: true });
    }
    if (interaction.options.getSubcommand() !== 'utente') return;

    const user = interaction.options.getUser('utente');
    const action = interaction.options.getString('azione');
    const reason = interaction.options.getString('motivo').trim();
    const selectedExpiry = interaction.options.getString('scadenza');
    if (!allActions.includes(action)) {
      return interaction.reply({ content: 'Azione non riconosciuta.', ephemeral: true });
    }
    const expiryText = getExpiryText(action, selectedExpiry);
    const embed = createSanctionEmbed(user, action, reason, expiryText);

    await interaction.reply({ embeds: [embed], allowedMentions: { parse: [] } });
    let dmSent = true;
    try {
      await user.send({ embeds: [embed], allowedMentions: { parse: [] } });
    } catch (error) {
      dmSent = false;
      console.error(`Impossibile inviare il DM all’utente ${user.id}:`, error);
    }
    return interaction.followUp({
      content: dmSent
        ? '✅ Sanzione pubblicata e DM inviato all’utente.'
        : '⚠️ Sanzione pubblicata, ma il DM non è stato recapitato. Controlla le impostazioni privacy dell’utente.',
      ephemeral: true
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Errore inatteso.';
    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({ content: `❌ ${message}`, ephemeral: true }).catch(() => {});
    }
    return interaction.reply({ content: `❌ ${message}`, ephemeral: true }).catch(() => {});
  }
});

client.login(process.env.DISCORD_TOKEN);
