import BigNumber from 'bignumber.js';
import expectThrow from 'zeppelin-solidity/test/helpers/expectThrow';
import increaseTime from 'zeppelin-solidity/test/helpers/increaseTime';

import byDays from './lib/helpers.js';
import defaults from './lib/defaults.js';

var DutchAuction = artifacts.require("./DutchAuction.sol");
var ShopToken = artifacts.require("./ShopToken.sol");

contract('PriceDecay', function (accounts) {
  let auctionContract;
  let tokenContract;

  // Assuming 1 ETH = 1000 USD
  const conversionRate = 0.001;

  // Reset contract state before each test case
  beforeEach(async function () {
    const startPrice = new BigNumber(19.99);
    const startPriceWei = startPrice.mul(conversionRate).mul(defaults.multiplier);

    // Deploy contracts
    auctionContract = await DutchAuction.new(startPriceWei.toNumber());
    tokenContract = await ShopToken.new(auctionContract.address, defaults.initialSupply, defaults.auctionSupply);

    // Setup and start auction
    await auctionContract.setupAuction(tokenContract.address);
    await auctionContract.startAuction();
  });

  async function assertDaysPassed(value) {
    let days = await auctionContract.getDays();
    assert.equal(days.toNumber(), value, "Number of passed days should be correct");
  }

  // Not actually USD
  async function assertPriceUSD(value) {
    let price = await auctionContract.getPrice();
    let priceUSD = web3.fromWei(price, "ether").div(conversionRate).toFormat(2, BigNumber.ROUND_HALF_UP);
    assert.equal(priceUSD, value, "Current day price should be correct");
  }

  it("Day 1 price should be $19.99", async function () {
    await assertDaysPassed(0);
    await assertPriceUSD(19.99);
  });

  it("Day 2 price should be $15.38", async function () {
    await increaseTime(byDays(1));
    await assertDaysPassed(1);
    await assertPriceUSD(15.38);
  });

  it("Day 3 price should be $11.84", async function () {
    await increaseTime(byDays(2));
    await assertDaysPassed(2);
    await assertPriceUSD(11.84);
  });

  it("Day 4 price should be $9.11", async function () {
    await increaseTime(byDays(3));
    await assertDaysPassed(3);
    await assertPriceUSD(9.11);
  });

  it("Day 5 price should be $7.01", async function () {
    await increaseTime(byDays(4));
    await assertDaysPassed(4);
    await assertPriceUSD(7.01);
  });

  it("Day 6 price should be $5.39", async function () {
    await increaseTime(byDays(5));
    await assertDaysPassed(5);
    await assertPriceUSD(5.39);
  });

  it("Day 7 price should be $4.15", async function () {
    await increaseTime(byDays(6));
    await assertDaysPassed(6);
    await assertPriceUSD(4.15);
  });

  it("Day 8 price should be $3.19", async function () {
    await increaseTime(byDays(7));
    await assertDaysPassed(7);
    await assertPriceUSD(3.19);
  });

  it("Day 9 price should be $2.46", async function () {
    await increaseTime(byDays(8));
    await assertDaysPassed(8);
    await assertPriceUSD(2.46);
  });

  it("Day 10 price should be $1.89", async function () {
    await increaseTime(byDays(9));
    await assertDaysPassed(9);
    await assertPriceUSD(1.89);
  });

  it("Day 11 price should be $1.45", async function () {
    await increaseTime(byDays(10));
    await assertDaysPassed(10);
    await assertPriceUSD(1.45);
  });

  it("Day 12 price should be $1.12", async function () {
    await increaseTime(byDays(11));
    await assertDaysPassed(11);
    await assertPriceUSD(1.12);
  });

  it("Day 13 price should be $0.86", async function () {
    await increaseTime(byDays(12));
    await assertDaysPassed(12);
    await assertPriceUSD(0.86);
  });

  it("Day 14 price should be $0.66", async function () {
    await increaseTime(byDays(13));
    await assertDaysPassed(13);
    await assertPriceUSD(0.66);
  });

  it("Day 15 price should be $0.51", async function () {
    await increaseTime(byDays(14));
    await assertDaysPassed(14);
    await assertPriceUSD(0.51);
  });

  it("Day 16 price should be $0.39", async function () {
    await increaseTime(byDays(15));
    await assertDaysPassed(15);
    await assertPriceUSD(0.39);
  });

  it("Day 17 price should be $0.3", async function () {
    await increaseTime(byDays(16));
    await assertDaysPassed(16);
    await assertPriceUSD(0.3);
  });

  it("Day 18 price should be $0.23", async function () {
    await increaseTime(byDays(17));
    await assertDaysPassed(17);
    await assertPriceUSD(0.23);
  });

  it("Day 19 price should be $0.18", async function () {
    await increaseTime(byDays(18));
    await assertDaysPassed(18);
    await assertPriceUSD(0.18);
  });

  it("Day 20 price should be $0.14", async function () {
    await increaseTime(byDays(19));
    await assertDaysPassed(19);
    await assertPriceUSD(0.14);
  });

  it("Day 21 price should be $0.11", async function () {
    await increaseTime(byDays(20));
    await assertDaysPassed(20);
    await assertPriceUSD(0.11);
  });

  it("Day 22 price should be $0.08", async function () {
    await increaseTime(byDays(21));
    await assertDaysPassed(21);
    await assertPriceUSD(0.08);
  });

  it("Day 23 price should be $0.06", async function () {
    await increaseTime(byDays(22));
    await assertDaysPassed(22);
    await assertPriceUSD(0.06);
  });

  it("Day 24 price should be $0.05", async function () {
    await increaseTime(byDays(23));
    await assertDaysPassed(23);
    await assertPriceUSD(0.05);
  });

  it("Day 25 price should be $0.04", async function () {
    await increaseTime(byDays(24));
    await assertDaysPassed(24);
    await assertPriceUSD(0.04);
  });

  it("Day 26 price should be $0.03", async function () {
    await increaseTime(byDays(25));
    await assertDaysPassed(25);
    await assertPriceUSD(0.03);
  });

  it("Day 27 price should be $0.02", async function () {
    await increaseTime(byDays(26));
    await assertDaysPassed(26);
    await assertPriceUSD(0.02);
  });

  it("Day 28 price should be $0.02", async function () {
    await increaseTime(byDays(27));
    await assertDaysPassed(27);
    await assertPriceUSD(0.02);
  });

  it("Day 29 price should be $0.01", async function () {
    await increaseTime(byDays(28));
    await assertDaysPassed(28);
    await assertPriceUSD(0.01);
  });

  it("Day 30 price should be $0.01", async function () {
    await increaseTime(byDays(29));
    await assertDaysPassed(29);
    await assertPriceUSD(0.01);
  });
});
