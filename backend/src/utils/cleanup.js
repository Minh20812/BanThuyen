import Player from "../models/PlayerModel.js";

const cleanupInactivePlayers = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const result = await Player.deleteMany({
      updatedAt: { $lt: oneDayAgo },
    });
    console.log(`Cleaned up ${result.deletedCount} inactive players`);
  } catch (error) {
    console.error("Error cleaning up inactive players:", error);
  }
};

export default cleanupInactivePlayers;
