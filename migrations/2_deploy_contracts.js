var DutchAuction = artifacts.require("DutchAuction");
var ShopToken = artifacts.require("ShopToken");

module.exports = function (deployer) {
  // Mint 1B tokens, transfer 100K for dutch auction
  const multiplier = 10 ** 18;
  const initialSupply = (10 ** 9) * multiplier;
  const auctionSupply = (10 ** 5) * multiplier;

  // Start with 500 Wei price per token unit
  const priceStart = 500;

  // Deploy
  deployer.deploy(DutchAuction, priceStart).then(function () {
    return deployer.deploy(ShopToken, DutchAuction.address, initialSupply, auctionSupply);
  });
};
