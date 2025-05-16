const axios = require("axios");

module.exports = {
  config: {
    name: "4k",
    version: "1.2",
    role: 0,
    author: "Team_Calyx | Fahim_Noob | Mod by Axiomatik",
    countDown: 5,
    longDescription: "Upscale multiple images to 4K resolution.",
    category: "image",
    guide: {
      en: "${pn} reply to one or several images to upscale them to 4K resolution."
    }
  },
  onStart: async function ({ message, event }) {
    let images = [];
    // 1. Si reply à un message avec plusieurs images
    if (event.messageReply && event.messageReply.attachments) {
      images = event.messageReply.attachments.filter(a => a.type === "photo");
    }
    // 2. Si images dans le message direct
    if (event.attachments && event.attachments.length > 0) {
      images = images.concat(event.attachments.filter(a => a.type === "photo"));
    }
    if (images.length === 0) return message.reply("Réponds à une ou plusieurs images à upscaler.");

    message.reply(`💎| Traitement de ${images.length} image(s)... Patiente.`, async (err, info) => {
      let upscaled = [];
      for (let img of images) {
        try {
          const imgurl = encodeURIComponent(img.url);
          const noobs = 'xyz';
          const upscaleUrl = `https://smfahim.${noobs}/4k?url=${imgurl}`;
          const { data: { image } } = await axios.get(upscaleUrl);
          const attachment = await global.utils.getStreamFromURL(image, "upscaled-image.png");
          upscaled.push(attachment);
        } catch (e) {
          upscaled.push(null); // Marque les erreurs, tu peux ajouter un log si tu veux.
        }
      }
      // Envoie toutes les images upscalées d’un coup
      if (upscaled.filter(Boolean).length === 0) {
        message.reply("❌| Erreur sur toutes les images.");
      } else {
        message.reply({
          body: `✅| ${upscaled.filter(Boolean).length} image(s) upscalée(s) en 4K.`,
          attachment: upscaled.filter(Boolean)
        });
      }
      let processingMsgID = info.messageID;
      message.unsend(processingMsgID);
    });
  }
};
