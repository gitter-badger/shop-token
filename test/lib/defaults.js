// Token constructor parameters
const decimals = 18;
const multiplier = 10 ** decimals;
const initialSupply = Math.pow(10, 9) * multiplier;
const auctionSupply = Math.pow(10, 4);
const tokenSupply = initialSupply - auctionSupply;

// Dutch auction constructor parameters
const priceStart = 500;

module.exports = {
  decimals,
  multiplier,
  initialSupply,
  auctionSupply,
  tokenSupply,
  priceStart
};
