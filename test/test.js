import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('DutchAuction', function (accounts) {
  // Account shortcuts
  const coinbase = accounts[0];

  // Token constructor parameters
  const decimals = 18;
  const multiplier = Math.pow(10, decimals);
  const initialSupply = Math.pow(10, 9) * multiplier;
  const auctionSupply = Math.pow(10, 8) * multiplier;
  const tokenSupply = initialSupply - auctionSupply;

  // Dutch auction constructor parameters
  const priceStart = 0.02 * multiplier;
  const priceConstant = 524880000;
  const priceExponent = 3;

  // ENUMs are not yet supported as ABI type
  // See https://github.com/ethereum/EIPs/issues/47
  const StagesEnum = {
    AuctionDeployed: 0,
    AuctionSetup: 1,
    AuctionStarted: 2,
    AuctionEnded: 3,
    TokensDistributed: 4
  }

  // Named constants
  const AUCTION_DEPLOYED = "AuctionDeployed";
  const AUCTION_SETUP = "AuctionSetup";
  const AUCTION_STARTED = "AuctionStarted";
  const AUCTION_ENDED = "AuctionEnded";
  const TOKENS_DISTRIBUTED = "TokensDistributed";

  let auctionContract;
  let tokenContract;

  // Reset contract state before each test case
  beforeEach(async function () {
    auctionContract = await DutchAuction.new(priceStart, priceConstant, priceExponent);
    tokenContract = await ShopToken.new(auctionContract.address, initialSupply, auctionSupply);
  });

  it("Should verify initial supply values", async function () {
    const auctionBalance = await tokenContract.balanceOf(auctionContract.address);
    const tokenBalance = await tokenContract.balanceOf(coinbase);

    assert.equal(auctionBalance.toNumber(), auctionSupply, "Auction balance should be 100M");
    assert.equal(tokenBalance.toNumber(), tokenSupply, "Token balance should be 900M");
  });

  it("Should verify `AuctionDeployed` stage", async function () {
    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, StagesEnum.AuctionDeployed, "Stage should be `AuctionDeployed`");

    // Expect errors if next stage != `AuctionSetup`
    await expectThrow(auctionContract.start());
    await expectThrow(auctionContract.finalize());
  });

  it("Should verify `AuctionSetup` stage", async function () {
    // Initial contract setup & event verification
    const result = await auctionContract.setup(tokenContract.address);
    assert.equal(result.logs[0].event, AUCTION_SETUP, "Should fire `AuctionSetup` event")

    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, StagesEnum.AuctionSetup, "Stage should be `AuctionSetup`");

    // Expect errors if next stage != `AuctionStarted`
    await expectThrow(auctionContract.setup(tokenContract.address));
    await expectThrow(auctionContract.finalize());
  });

  it("Should verify `AuctionStarted` stage", async function () {
    // Initial contract setup & event verification
    await auctionContract.setup(tokenContract.address);
    const result = await auctionContract.start();
    assert.equal(result.logs[0].event, AUCTION_STARTED, "Should fire `AuctionStarted` event")

    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, StagesEnum.AuctionStarted, "Stage should be `AuctionStarted`");

    // Expect errors if next stage != `AuctionEnded`
    await expectThrow(auctionContract.start());
    await expectThrow(auctionContract.setup(tokenContract.address));
  });

  it("Should verify `AuctionEnded` stage", async function () {
    // Initial contract setup & event verification
    await auctionContract.setup(tokenContract.address);
    await auctionContract.start();
    const result = await auctionContract.finalize();
    assert.equal(result.logs[0].event, AUCTION_ENDED, "Should fire `AuctionEnded` event")

    // Stage verification
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, StagesEnum.AuctionEnded, "Stage should be `AuctionEnded`");

    // Expect errors if next stage != `TokensDistributed`
    await expectThrow(auctionContract.start());
    await expectThrow(auctionContract.setup(tokenContract.address));
    await expectThrow(auctionContract.finalize());
  });
});
