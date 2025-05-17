module.exports = {
  config: {
    name: "listgroups",
    version: "1.3",
    author: "TonNom",
    description: "Liste tous les groupes où le bot est présent avec leur UID et nombre de membres. (Admin uniquement)",
    usage: "listgroups",
    permissions: [2]
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // UID admin autorisé
    const adminIDs = ["100080479775577"];
    if (!adminIDs.includes(senderID)) {
      return api.sendMessage("❌ Cette commande est réservée à l'administrateur du bot.", threadID);
    }

    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threads.filter(thread => thread.isGroup);

      if (groupThreads.length === 0) {
        return api.sendMessage("❌ Je ne suis dans aucun groupe.", threadID);
      }

      let msg = "Liste des groupes où je suis :\n\n";

      for (const thread of groupThreads) {
        const threadInfo = await api.getThreadInfo(thread.threadID);
        msg += `🌊 Nom : ${thread.name || "Sans nom"}\n`;
        msg += `UID : ${thread.threadID}\n`;
        msg += `👥 Membres : ${threadInfo.participantIDs.length}\n\n`;
      }

      return api.sendMessage(msg.trim(), threadID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Une erreur est survenue en listant les groupes.", threadID);
    }
  }
};