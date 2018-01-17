var DutchAuction = artifacts.require("DutchAuction");
var ShopToken = artifacts.require("ShopToken");

module.exports = async function (deployer) {
  // Token unit multiplier, 10^18
  const decimals = 10;
  const multiplier = Math.pow(10, decimals);

  // Mint 1MM tokens, transfer 10M for dutch auction
  const initialSupply = Math.pow(10, 9) * multiplier;
  const auctionSupply = Math.pow(10, 8) * multiplier;

  // Start with 0.02 ETH price
  const priceStart = 0.02 * multiplier;
  const priceConstant = 524880000;
  const priceExponent = 3;

  // Deploy
  await deployer.deploy(DutchAuction, priceStart, priceConstant, priceExponent);
  await deployer.deploy(ShopToken, DutchAuction.address, initialSupply, auctionSupply);
};
