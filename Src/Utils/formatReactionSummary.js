export function formatReactionSummary(reactionSummary = {}, myReaction = null) {
  const total = reactionSummary.total || 0;

  const types = Object.entries(reactionSummary.types || {})
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    types,
    myReaction,
  };
}
