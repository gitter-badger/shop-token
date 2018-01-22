import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';
import defaults from './lib/defaults.js';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('OwnerModifier', function (accounts) {
  let auctionContract;
  let tokenContract;

  // Reset contract state before each test case
  beforeEach(async function () {
    auctionContract = await DutchAuction.new(defaults.priceStart, defaults.priceDecay, defaults.minimumBid);
    tokenContract = await ShopToken.new(auctionContract.address, defaults.initialSupply, defaults.auctionSupply);
  });

  it("Shouldn't allow stage transition from non-owner account", async function () {
    let fromNonOwner = { from: accounts[1] };

    // Throw on `AuctionDeployed` ⇒ `AuctionSetup`
    await expectThrow(auctionContract.setupAuction(tokenContract.address, fromNonOwner));

    // Throw on `AuctionSetup` ⇒ `AuctionStarted`
    await auctionContract.setupAuction(tokenContract.address);
    await expectThrow(auctionContract.startAuction(fromNonOwner));

    // Throw on `AuctionSetup` ⇒ `AuctionEnded`
    await auctionContract.startAuction();
    await expectThrow(auctionContract.endAuction(fromNonOwner));
  });
});
