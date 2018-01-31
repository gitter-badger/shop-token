import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';
import defaults from './lib/defaults.js';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('OwnerInterface', function (accounts) {
  let auctionContract;
  let tokenContract;
  const fromNonOwner = { from: accounts[1] };

  // Reset contract state before each test case
  beforeEach(async function () {
    auctionContract = await DutchAuction.new(defaults.priceStart);
    tokenContract = await ShopToken.new(auctionContract.address, defaults.initialSupply, defaults.auctionSupply);
  });

  it("Only owner can perform stage transition", async function () {
    // Throw on `AuctionDeployed` ⇒ `AuctionSetup`
    await expectThrow(auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus, fromNonOwner));

    // Throw on `AuctionSetup` ⇒ `AuctionStarted`
    await auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus);
    await expectThrow(auctionContract.startAuction(fromNonOwner));

    // Throw on `AuctionSetup` ⇒ `AuctionEnded`
    await auctionContract.startAuction();
    await expectThrow(auctionContract.endAuction(fromNonOwner));
  });
});
