var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('DutchAuction', function (accounts) {
  // Accounts
  var coinbase = accounts[0];

  // Balances
  var multipler = Math.pow(10, 18);
  var totalSupply = 1000 * 1000 * 1000 * multipler;
  var auctionSupply = 100 * 1000 * 1000 * multipler;
  var tokenSupply = totalSupply - auctionSupply;

  // ENUMs are not yet supported as ABI type
  // See https://github.com/ethereum/EIPs/issues/47
  var StagesEnum = {
    AuctionDeployed: 0,
    AuctionSetUp: 1,
    AuctionStarted: 2,
    AuctionEnded: 3,
    TokensDistributed: 4
  }

  it("Should verify dutch auction stage", async function () {
    const auction = await DutchAuction.deployed();
    const stage = await auction.stage.call();
    assert.equal(stage, StagesEnum.AuctionDeployed, "Stage should be AuctionDeployed");
  });

  it("Should verify initial supply", async function () {
    const auction = await DutchAuction.deployed();
    const token = await ShopToken.deployed();

    const auctionBalance = await token.balanceOf(auction.address);
    const tokenBalance = await token.balanceOf(coinbase);

    assert.equal(auctionBalance.toNumber(), auctionSupply, "Auction balance should be 100M");
    assert.equal(tokenBalance.toNumber(), tokenSupply, "Token balance should be 900M");
  });
});
