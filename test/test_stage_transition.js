import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';
import defaults from './lib/defaults.js'
import stages from './lib/stages.js';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('StageTransition', function (accounts) {
  // Account shortcuts
  const coinbase = accounts[0];

  let auctionContract;
  let tokenContract;

  // Reset contract state before each test case
  beforeEach(async function () {
    auctionContract = await DutchAuction.new(defaults.priceStart, defaults.priceDecay, defaults.minimumBid);
    tokenContract = await ShopToken.new(auctionContract.address, defaults.initialSupply, defaults.auctionSupply);
  });

  it("Should verify initial supply values", async function () {
    const auctionBalance = await tokenContract.balanceOf(auctionContract.address);
    const tokenBalance = await tokenContract.balanceOf(coinbase);

    assert.equal(auctionBalance.toNumber(), defaults.auctionSupply, "Auction balance should be 10K");
    assert.equal(tokenBalance.toNumber(), defaults.tokenSupply, "Token balance should be 990M");
  });

  it("Should verify `AuctionDeployed` stage", async function () {
    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, stages.Enum.AuctionDeployed, "Stage should be `AuctionDeployed`");

    // Expect errors if next stage != `AuctionSetup`
    await expectThrow(auctionContract.startAuction());
    await expectThrow(auctionContract.endAuction());
  });

  it("Should verify `AuctionSetup` stage", async function () {
    // Initial contract setup & event verification
    const result = await auctionContract.setupAuction(tokenContract.address);
    assert.equal(result.logs[0].event, stages.AUCTION_SETUP, "Should fire `AuctionSetup` event")

    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, stages.Enum.AuctionSetup, "Stage should be `AuctionSetup`");

    // Expect errors if next stage != `AuctionStarted`
    await expectThrow(auctionContract.setupAuction(tokenContract.address));
    await expectThrow(auctionContract.endAuction());
  });

  it("Should verify `AuctionStarted` stage", async function () {
    // Initial contract setup & event verification
    await auctionContract.setupAuction(tokenContract.address);
    const result = await auctionContract.startAuction();
    assert.equal(result.logs[0].event, stages.AUCTION_STARTED, "Should fire `AuctionStarted` event")

    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, stages.Enum.AuctionStarted, "Stage should be `AuctionStarted`");

    // Expect errors if next stage != `AuctionEnded`
    await expectThrow(auctionContract.startAuction());
    await expectThrow(auctionContract.setupAuction(tokenContract.address));
  });

  it("Should verify `AuctionEnded` stage", async function () {
    // Initial contract setup & event verification
    await auctionContract.setupAuction(tokenContract.address);
    await auctionContract.startAuction();
    const result = await auctionContract.endAuction();
    assert.equal(result.logs[0].event, stages.AUCTION_ENDED, "Should fire `AuctionEnded` event")

    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, stages.Enum.AuctionEnded, "Stage should be `AuctionEnded`");

    // Expect errors if next stage != `TokensDistributed`
    await expectThrow(auctionContract.startAuction());
    await expectThrow(auctionContract.setupAuction(tokenContract.address));
    await expectThrow(auctionContract.endAuction());
  });
});
