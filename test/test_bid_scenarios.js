import BigNumber from 'bignumber.js';
import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';
import increaseTime from 'zeppelin-solidity/test/helpers/increaseTime';

import byDays from './lib/helpers.js';
import defaults from './lib/defaults.js';
import stages from './lib/stages.js';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('BidScenarios', function (accounts) {
  let auctionContract;
  let tokenContract;

  // Reset contract state before each test case
  beforeEach(async function () {
    const startPrice = new BigNumber(20);

    // Deploy contracts
    auctionContract = await DutchAuction.new(startPrice.toNumber());
    tokenContract = await ShopToken.new(auctionContract.address, defaults.initialSupply, defaults.auctionSupply);

    // Setup and start auction
    await auctionContract.setupAuction(tokenContract.address);
    await auctionContract.startAuction();
  });

  async function assertCurrentPrice(value) {
    let result = await auctionContract.getPrice();
    assert.equal(result.toNumber(), value, "Current price should be correct");
  }

  async function assertTotalUnitsSold(value) {
    let result = await auctionContract.total_units_sold.call();
    assert.equal(result.toNumber(), value, "Total sold units should be correct");
  }

  /*
   * === 1st bidding scenario ===
   *
   * Bids:
   * | Day | Bidder | Current Price | Token Units Sought | Amount Bid  |
   * | === | ====== | ============= | ================== | =========== |
   * | 1   | A      | 20 wei        | 1500               | 30000 wei   |
   * | 2   | B      | 15 wei        | 3500               | 52500 wei   |
   * | 3   | C      | 11 wei        | 3000               | 33000 wei   |
   * | 4   | D      | 9 wei         | 2000               | 18000 wei   |
   *
   * Results:
   * Final price - 9 wei
   * - Bidder A will receive 3333 token units
   * - Bidder B will receive 5833 token units
   * - Bidder C will receive 3666 token units
   * - Bidder D will receive 2000 token units
   */
  it("Should verify 1st bidding scenario", async function () {
    let result;
    let current_price;
    let total_units_sold;
    let total_token_units;

    // Verify total token units first
    total_token_units = await auctionContract.total_token_units.call();
    assert.equal(total_token_units.toNumber(), defaults.auctionSupply, "Total token units should be equal to 10000");

    // Verify initial values
    await assertTotalUnitsSold(0);
    await assertCurrentPrice(20);

    // Place 1st bid
    result = await auctionContract.sendTransaction({ from: accounts[1], value: 30000 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 1500, "Should sought 1500 token units");
    await assertTotalUnitsSold(1500);

    // Fast-forward 1st day
    await increaseTime(byDays(1));
    await assertCurrentPrice(15);

    // Place 2nd bid
    result = await auctionContract.sendTransaction({ from: accounts[2], value: 52500 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 3500, "Should sought 3500 token units");
    await assertTotalUnitsSold(5000);

    // Fast-forward 2nd day
    await increaseTime(byDays(1));
    await assertCurrentPrice(11);

    // Place 3rd bid
    result = await auctionContract.sendTransaction({ from: accounts[3], value: 33000 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 3000, "Should sought 3000 token units");
    await assertTotalUnitsSold(8000);

    // Fast-forward 3rd day
    await increaseTime(byDays(1));
    await assertCurrentPrice(9);

    // Place 4th bid
    result = await auctionContract.sendTransaction({ from: accounts[4], value: 18000 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 2000, "Should sought 2000 token units");
    assert.equal(result.logs[1].event, stages.AUCTION_ENDED, "Should fire `AuctionEnded` event");
    await assertTotalUnitsSold(10000);

    // Verify final price
    let final_price = await auctionContract.price_final.call();
    assert.equal(final_price.toNumber(), 9, "Final price should be equal to 9 wei");

    // All token units should be sold out
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, stages.Enum.AuctionEnded, "Stage should be `AuctionEnded`");

    // View tokens to receive for each address
    let result1 = await auctionContract.viewTokensToReceive({ from: accounts[1] });
    let result2 = await auctionContract.viewTokensToReceive({ from: accounts[2] });
    let result3 = await auctionContract.viewTokensToReceive({ from: accounts[3] });
    let result4 = await auctionContract.viewTokensToReceive({ from: accounts[4] });
    assert.equal(result1.toNumber(), 3333, "Bidder A will receive 3333 token units");
    assert.equal(result2.toNumber(), 5833, "Bidder B will receive 5833 token units");
    assert.equal(result3.toNumber(), 3666, "Bidder C will receive 3666 token units");
    assert.equal(result4.toNumber(), 2000, "Bidder D will receive 2000 token units");
  });
});
