# Ndrangheta Control — bot Discord separato

Questo pacchetto è indipendente dal bot Datacenter. Include il comando `/sanziona utente` che pubblica l’embed nel canale in cui viene usato e invia lo stesso embed in DM.

## Setup
1. Installa Node.js 20 o superiore.
2. Esegui `npm install`.
3. Copia `.env.example` in `.env` e configura `DISCORD_TOKEN`, `CLIENT_ID` e `GUILD_ID` per il bot/server Ndrangheta Control. Non condividere il token.
4. Registra il comando con `npm run register`.
5. Avvia il bot con `npm start`.

Il comando è limitato agli utenti con permesso **Gestisci server**. Le scadenze 7–30 giorni sono selezionabili; il Depex non scade e l’opzione permanente è consentita per Espulsione e Ban. Per `Ban permanente`, il campo scadenza è automaticamente “Mai (Permanente)”.

Il bot comunica la sanzione ma non esegue ban, espulsioni, modifiche di ruoli o scadenze automatiche. La scadenza viene riportata nell’embed.
