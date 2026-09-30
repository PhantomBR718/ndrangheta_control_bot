import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
  throw new Error('Configura DISCORD_TOKEN, CLIENT_ID e GUILD_ID nell’ambiente del bot.');
}

const actions = [
  'Avviso 1', 'Avviso 2', 'Avviso 3', 'Sospensione', 'Depex',
  'Licenziamento', 'Auto-Licenziamento', 'Espulsione', 'Ban Temporaneo', 'Ban permanente'
];
const expiryChoices = [
  ...Array.from({ length: 24 }, (_, index) => {
    const days = index + 7;
    return { name: `${days} giorni`, value: String(days) };
  }),
  { name: 'Mai (Permanente)', value: 'permanente' }
];

const command = new SlashCommandBuilder()
  .setName('sanziona')
  .setDescription('Emette e comunica una sanzione')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand => subcommand
    .setName('utente')
    .setDescription('Comunica una sanzione a un utente')
    .addUserOption(option => option
      .setName('utente')
      .setDescription('Utente da sanzionare')
      .setRequired(true))
    .addStringOption(option => option
      .setName('azione')
      .setDescription('Azione da emettere')
      .setRequired(true)
      .addChoices(...actions.map(value => ({ name: value, value }))))
    .addStringOption(option => option
      .setName('motivo')
      .setDescription('Motivo della sanzione')
      .setRequired(true)
      .setMaxLength(1000))
    .addStringOption(option => option
      .setName('scadenza')
      .setDescription('Seleziona 7–30 giorni; permanente solo per Espulsione/Ban')
      .setRequired(false)
      .addChoices(...expiryChoices)));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: [command.toJSON()] }
);
console.log('Comando /sanziona utente registrato nel server configurato.');
