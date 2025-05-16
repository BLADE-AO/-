const axios = require('axios');

module.exports = {
  config: {
    name: "dictio",
    version: "1.0",
    author: "Axiomatik",
    role: 0,
    shortDescription: "Définition d'un mot (EN)",
    longDescription: "Affiche la définition d’un mot anglais.",
    category: "utilitaire",
    guide: "{p}dictio [mot]"
  },

  onStart: async function({ api, event, args }) {
    if (!args[0]) return api.sendMessage("Tape un mot à définir. Exemple : /dictio cat", event.threadID, event.messageID);
    const mot = args.join(' ').toLowerCase();

    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(mot)}`;
      const res = await axios.get(url);
      if (!res.data || !res.data[0].meanings || !res.data[0].meanings[0].definitions[0]) 
        return api.sendMessage("Aucune définition trouvée.", event.threadID, event.messageID);

      const def = res.data[0].meanings[0].definitions[0].definition;
      api.sendMessage(`Definition of "${mot}":\n${def}`, event.threadID, event.messageID);
    } catch (e) {
      api.sendMessage("Erreur ou mot introuvable.", event.threadID, event.messageID);
    }
  }
};
