import BlackListedTokens from "../DB/Models/blackListedTokens.model.js";

export async function isTokenBlacklisted(tokenId, blacklistedTokens) {
  const isTokenBlacklisted = await BlackListedTokens.findOne({
    tokenId,
  });

  return isTokenBlacklisted;
}
