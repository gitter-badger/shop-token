var DutchAuction = artifacts.require("DutchAuction");
var ShopToken = artifacts.require("ShopToken");

module.exports = function (deployer) {
  // Token unit multiplier, 10^18
  const decimals = 18;
  const multiplier = Math.pow(10, decimals);

  // Mint 1B tokens, transfer 100K for dutch auction
  const initialSupply = Math.pow(10, 9) * multiplier;
  const auctionSupply = Math.pow(10, 5) * multiplier;

  // Start with 500 Wei price per token unit
  const priceStart = 500;

  // Deploy
  deployer.deploy(DutchAuction, priceStart).then(function () {
    return deployer.deploy(ShopToken, DutchAuction.address, initialSupply, auctionSupply);
  });
};
