module.exports = {
  config: {
    name: "sicbo",
    aliases: ["sic"],
    version: "1.1",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 20,
    role: 0,
    shortDescription: "Play Sicbo, the oldest gambling game",
    longDescription: "Play Sicbo, a fun dice gambling game, with a chance to win big or lose it all!",
    category: "game",
    guide: "{pn} <Small/Big> <amount of money>",
  },

  onStart: async function ({ args, message, usersData, event }) {
    const betType = args[0]?.toLowerCase();
    const betAmount = parseInt(args[1]);
    const user = event.senderID;
    const userData = await usersData.get(event.senderID);

    // Show the usual message and game rules
    if (args.length === 0) {
      return message.reply(`
🎲 *Welcome to Sicbo!*

🔹 **How to play**: 
- Bet on whether the sum of the three dice will be **Small** (4-10) or **Big** (11-17).
- **Small** = Total between 4 and 10
- **Big** = Total between 11 and 17

🔹 **Special Payouts**:
- **Jackpot**: 3 fives = 7x your bet!
- **Bonus**: 3 threes = 3.5x your bet!

🔹 **Normal Payout**: 
- If your bet matches the dice outcome (Small or Big), you win 2x your bet.

🔹 **Conditions**:
- A **65% chance** of winning on normal bets (Small or Big). 
- If you win, you earn your payout, if you lose, you lose your bet.

💎 *Place your bet by typing*: {pn} <Small/Big> <amount of money>
      `);
    }

    if (!["small", "big"].includes(betType)) {
      return message.reply("🙈 | Please choose between 'small' or 'big'.");
    }

    if (!Number.isInteger(betAmount) || betAmount < 50) {
      return message.reply("❌ | Your bet must be at least 50 spina.");
    }

    if (betAmount > userData.money) {
      return message.reply("💸 | You don't have enough money to place this bet.");
    }

    const dice = [1, 2, 3, 4, 5, 6];
    const results = [];

    for (let i = 0; i < 3; i++) {
      results.push(dice[Math.floor(Math.random() * dice.length)]);
    }

    const total = results.reduce((sum, num) => sum + num, 0);
    const isSmall = total >= 4 && total <= 10;
    const isBig = total >= 11 && total <= 17;

    // Jackpot condition (3 fives)
    const isJackpot = results.every(num => num === 5);
    let winAmount = 0;

    // Bonus condition (3 threes)
    const isBonus = results.every(num => num === 3);
    
    if (isJackpot) {
      winAmount = betAmount * 7;  // Jackpot payout
    } else if (isBonus) {
      winAmount = betAmount * 3.5;  // Bonus payout for three 3's
    } else {
      // Normal win condition with 65% success rate
      const isWin = (betType === "small" && isSmall) || (betType === "big" && isBig);
      if (Math.random() < 0.65) { // 65% chance to win the normal condition
        if (isWin) {
          winAmount = betAmount * 2;  // Normal win payout
        } else {
          winAmount = -betAmount;  // Loss
        }
      } else {
        winAmount = -betAmount;  // 35% chance of loss
      }
    }

    userData.money += winAmount;
    await usersData.set(event.senderID, userData);

    const resultMessage = winAmount > 0
      ? `🎉 *Congratulations!* You won **${winAmount} spina**! 🍀\n\n💰 New balance: ${userData.money} spina.`
      : `💔 *Oh no!* Luck wasn't on your side, and you lost **${betAmount} spina**. 😿\n\n💸 Remaining balance: ${userData.money} spina.`;

    const decoration = winAmount > 0
      ? "🎊✨🔥✨🎊"
      : "💀☠💔☠💀";

    message.reply(
      `🎲 *Sicbo Game Results* 🎲\n\n` +
      `${decoration}\n` +
      `🔢 Dice Rolls: ${results.map((num) => `🎲 ${num}`).join(" | ")}\n` +
      `🎯 Bet Type: *${betType.toUpperCase()}*\n` +
      `💎 Total: ${total}\n\n` +
      `${resultMessage}\n` +
      `${decoration}`
    );
  },
};