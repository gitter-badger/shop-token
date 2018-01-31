// Dutch auction constructor parameters
const priceStart = 500;
const offering = 10 ** 4;
const bonus = 500;

// Token constructor parameters
const multiplier = 10 ** 18;
const initialSupply = (10 ** 9) * multiplier;
const auctionSupply = offering + bonus;
const tokenSupply = initialSupply - auctionSupply;

module.exports = {
  multiplier,
  initialSupply,
  auctionSupply,
  tokenSupply,
  offering,
  bonus,
  priceStart
};
