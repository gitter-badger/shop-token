var DutchAuction = artifacts.require("DutchAuction");
var ShopToken = artifacts.require("ShopToken");

module.exports = function (deployer) {
  deployer.deploy(DutchAuction).then(function () {
    return deployer.deploy(ShopToken, DutchAuction.address);
  });
};
