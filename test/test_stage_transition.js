import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';

import defaults from './lib/defaults.js'
import events from './lib/events.js';
import stages from './lib/stages.js';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('StageTransition', function (accounts) {
  let auctionContract;
  let tokenContract;

  // Reset contract state before each test case
  beforeEach(async function () {
    auctionContract = await DutchAuction.new(defaults.priceStart);
    tokenContract = await ShopToken.new(auctionContract.address, defaults.initialSupply, defaults.auctionSupply);
  });

  async function assertCurrentStage(stage) {
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, stage, "Current stage should be correct");
  }

  it("Should verify initial supply values", async function () {
    const auctionBalance = await tokenContract.balanceOf(auctionContract.address);
    const tokenBalance = await tokenContract.balanceOf(accounts[0]);

    assert.equal(auctionBalance.toNumber(), defaults.auctionSupply, "Auction balance should be 10.5K");
    assert.equal(tokenBalance.toNumber(), defaults.tokenSupply, "Token balance should be 990M");
  });

  it("Should verify `AuctionDeployed` stage", async function () {
    await assertCurrentStage(stages.AuctionDeployed)
    await expectThrow(auctionContract.startAuction());
    await expectThrow(auctionContract.endAuction());
  });

  it("Should verify `AuctionSetup` stage", async function () {
    // Initial contract setup & event verification
    const result = await auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus);
    assert.equal(result.logs[0].event, events.AUCTION_SETUP, "Should fire `AuctionSetup` event")

    // Verify current stage & impossible transition
    await assertCurrentStage(stages.AuctionSetup)
    await expectThrow(auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus));
    await expectThrow(auctionContract.endAuction());
  });

  it("Should verify `AuctionStarted` stage", async function () {
    // Initial contract setup & event verification
    await auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus);
    const result = await auctionContract.startAuction();
    assert.equal(result.logs[0].event, events.AUCTION_STARTED, "Should fire `AuctionStarted` event")

    // Verify current stage & impossible transition
    await assertCurrentStage(stages.AuctionStarted)
    await expectThrow(auctionContract.startAuction());
    await expectThrow(auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus));
  });

  it("Should verify `AuctionEnded` stage", async function () {
    // Initial contract setup & event verification
    await auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus);
    await auctionContract.startAuction();
    const result = await auctionContract.endAuction();
    assert.equal(result.logs[0].event, events.AUCTION_ENDED, "Should fire `AuctionEnded` event")

    // Verify current stage & impossible transition
    await assertCurrentStage(stages.AuctionEnded)
    await expectThrow(auctionContract.startAuction());
    await expectThrow(auctionContract.setupAuction(tokenContract.address, defaults.offering, defaults.bonus));
    await expectThrow(auctionContract.endAuction());
  });
});
