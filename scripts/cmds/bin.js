const axios = require("axios");
const vm = require("vm");

module.exports = {
  config: {
    name: "bin",
    version: "1.0",
    author: "Axiomatik",
    role: 2, // admin uniquement par sécurité
    shortDescription: "Exécute du code depuis un Pastebin",
    longDescription: "Télécharge et exécute un code JavaScript depuis un lien Pastebin (format brut).",
    category: "admin",
    guide: "{pn} <lien pastebin> [args]\nEx: {pn} https://pastebin.com/vvvca14B"
  },

  onStart: async function({ message, args, event }) {
    if (!args[0] || !args[0].startsWith("http")) {
      return message.reply("Donne un lien pastebin brut ! Ex: https://pastebin.com/raw/vvvca14B");
    }

    let pasteUrl = args[0];
    if (!pasteUrl.includes("/raw/")) {
      // Convertit automatiquement vers le lien /raw/
      const id = pasteUrl.split("/").pop();
      pasteUrl = "https://pastebin.com/raw/" + id;
    }

    try {
      const res = await axios.get(pasteUrl);
      const code = res.data;

      // Exécute dans un contexte isolé (sandbox)
      const script = new vm.Script(code);
      const context = vm.createContext({
        console,
        module: {},
        exports: {},
        require,
        message,
        event,
        args: args.slice(1)
      });
      script.runInContext(context);

      message.reply("✅ Code Pastebin exécuté avec succès.");
    } catch (err) {
      message.reply("Erreur d’exécution ou de téléchargement : " + err.message);
    }
  }
};
