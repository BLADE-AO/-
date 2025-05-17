const fs = require("fs");
const axios = require("axios");
const path = __dirname + "/antichangeinfobox.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

module.exports = {
  config: {
    name: "antichangeinfobox",
    version: "1.2",
    author: "TonNom",
    description: "Empêche les non-admins de modifier le nom, la photo ou les pseudos du groupe.",
    usage: "antichangeinfobox on | off",
    permissions: [0]
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    const info = await api.getThreadInfo(threadID);
    if (!info.adminIDs.some(admin => admin.id == senderID)) {
      return api.sendMessage("❌ Seuls les administrateurs du groupe peuvent utiliser cette commande.", threadID);
    }

    const data = JSON.parse(fs.readFileSync(path));
    const status = args[0];

    if (status === "on") {
      const nicknames = {};
      for (const id in info.nicknames) {
        nicknames[id] = info.nicknames[id] || "";
      }

      data[threadID] = {
        name: info.threadName,
        nicknames: nicknames,
        imageSrc: info.imageSrc || null,
        lastImageFix: 0
      };

      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("✅ Anti-changement activé pour ce groupe.", threadID);
    }

    if (status === "off") {
      delete data[threadID];
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("✅ Anti-changement désactivé pour ce groupe.", threadID);
    }

    return api.sendMessage("Utilisation : antichangeinfobox on | off", threadID);
  },

  onEvent: async function ({ api, event }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const data = JSON.parse(fs.readFileSync(path));
    if (!data[threadID]) return;

    const info = await api.getThreadInfo(threadID);
    const isAuthorAdmin = info.adminIDs.some(admin => admin.id == author);
    if (isAuthorAdmin) return;

    const saved = data[threadID];

    // Revenir au nom du groupe enregistré
    if (logMessageType === "log:thread-name") {
      if (info.threadName !== saved.name) {
        api.setTitle(saved.name, threadID);
      }
    }

    // Rétablir le pseudo si modifié ou supprimé
    if (logMessageType === "log:thread-nickname") {
      const userID = logMessageData.participant_id;
      const originalNicknames = saved.nicknames || {};
      const originalNickname = originalNicknames[userID] || "";

      api.changeNickname(originalNickname, threadID, userID, (err) => {
        if (err) console.log("Erreur pour remettre le pseudo :", err);
      });
    }

    // Rétablir la photo si modifiée (avec délai anti-spam)
    if (logMessageType === "log:thread-image" && saved.imageSrc) {
      const now = Date.now();
      const delay = 10 * 1000;

      if (now - (saved.lastImageFix || 0) < delay) return;

      if (info.imageSrc !== saved.imageSrc) {
        try {
          const img = (await axios.get(saved.imageSrc, { responseType: "stream" })).data;
          await api.changeGroupImage(img, threadID);
          data[threadID].lastImageFix = now;
          fs.writeFileSync(path, JSON.stringify(data, null, 2));
        } catch (e) {
          console.error("Erreur lors de la restauration de la photo :", e.message);
        }
      }
    }
  }
};