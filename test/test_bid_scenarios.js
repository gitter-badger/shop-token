import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';
import defaults from './lib/defaults.js';
import stages from './lib/stages.js';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('BidScenarios', function (accounts) {
  let auctionContract;
  let tokenContract;

  // Reset contract state before each test case
  beforeEach(async function () {
    auctionContract = await DutchAuction.new(defaults.priceStart, defaults.priceDecay, defaults.minimumBid);
    tokenContract = await ShopToken.new(auctionContract.address, defaults.initialSupply, defaults.auctionSupply);

    // Setup and start auction
    await auctionContract.setupAuction(tokenContract.address);
    await auctionContract.startAuction();
  });

  async function assertAcceptedBids(value) {
    let result = await auctionContract.bids_accepted.call();
    assert.equal(result.toNumber(), value, "Accepted bids should be correct");
  }

  async function assertCurrentPrice(value) {
    let result = await auctionContract.price_current.call();
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
   * | Bidder | Current Price | Token Units Sought | Amount Bid  |
   * | ====== | ============= | ================== | =========== |
   * | A      | 500 wei       | 1500               | 750000 wei  |
   * | B      | 475 wei       | 3500               | 1662500 wei |
   * | C      | 450 wei       | 3000               | 1350000 wei |
   * | D      | 425 wei       | 2000               | 850000 wei  |
   *
   * Results:
   * Final price - 425 wei
   * - Bidder A will receive 1764 token units
   * - Bidder B will receive 3911 token units
   * - Bidder C will receive 3176 token units
   * - Bidder D will receive 2000 token units
   */
  it("Should verify 1st bidding scenario", async function () {
    let result;
    let current_price;
    let bids_accepted;
    let total_units_sold;
    let total_token_units;

    // Verify total token units first
    total_token_units = await auctionContract.total_token_units.call();
    assert.equal(total_token_units.toNumber(), defaults.auctionSupply, "Total token units should be equal to 10000");

    // Verify initial values
    await assertAcceptedBids(0);
    await assertCurrentPrice(500);
    await assertTotalUnitsSold(0);

    // Place 1st bid and verify values
    result = await auctionContract.placeBid({ from: accounts[1], value: 750000 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 1500, "Should sought 1500 token units");
    await assertAcceptedBids(1);
    await assertCurrentPrice(475);
    await assertTotalUnitsSold(1500);

    // Place 2st bid and verify values
    result = await auctionContract.placeBid({ from: accounts[2], value: 1662500 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 3500, "Should sought 3500 token units");
    await assertAcceptedBids(2);
    await assertCurrentPrice(450);
    await assertTotalUnitsSold(5000);

    // Place 3rd bid and verify values
    result = await auctionContract.placeBid({ from: accounts[3], value: 1350000 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 3000, "Should sought 3000 token units");
    await assertAcceptedBids(3);
    await assertCurrentPrice(425);
    await assertTotalUnitsSold(8000);

    // Place 4th bid and verify values
    result = await auctionContract.placeBid({ from: accounts[4], value: 850000 });
    assert.equal(result.logs[0].event, stages.BID_RECEIVED, "Should fire `BidReceived` event");
    assert.equal(result.logs[0].args.quantity, 2000, "Should sought 2000 token units");
    assert.equal(result.logs[1].event, stages.AUCTION_ENDED, "Should fire `AuctionEnded` event");
    await assertAcceptedBids(4);
    await assertCurrentPrice(400);
    await assertTotalUnitsSold(10000);

    // Verify final price
    let final_price = await auctionContract.price_final.call();
    assert.equal(final_price.toNumber(), 425, "Final price should be equal to 425");

    // All token units should be sold out
    const current_stage = await auctionContract.current_stage.call();
    assert.equal(current_stage, stages.Enum.AuctionEnded, "Stage should be `AuctionEnded`");

    // View tokens to receive for each address
    let result1 = await auctionContract.viewTokensToReceive({ from: accounts[1] });
    let result2 = await auctionContract.viewTokensToReceive({ from: accounts[2] });
    let result3 = await auctionContract.viewTokensToReceive({ from: accounts[3] });
    let result4 = await auctionContract.viewTokensToReceive({ from: accounts[4] });
    assert.equal(result1.toNumber(), 1764, "Bidder A will receive 1764 token units");
    assert.equal(result2.toNumber(), 3911, "Bidder B will receive 3911 token units");
    assert.equal(result3.toNumber(), 3176, "Bidder C will receive 3176 token units");
    assert.equal(result4.toNumber(), 2000, "Bidder D will receive 2000 token units");
  });
});
