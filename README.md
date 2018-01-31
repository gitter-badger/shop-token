# SHOP Token

[![CircleCI](https://circleci.com/gh/ShoppersShop/shop-token.svg?style=svg)](https://circleci.com/gh/ShoppersShop/shop-token) [![dependencies Status](https://david-dm.org/ShoppersShop/shop-token/status.svg)](https://david-dm.org/ShoppersShop/shop-token) [![devDependencies Status](https://david-dm.org/ShoppersShop/shop-token/dev-status.svg)](https://david-dm.org/ShoppersShop/shop-token?type=dev) [![Coverage Status](https://coveralls.io/repos/github/ShoppersShop/shop-token/badge.svg?branch=master)](https://coveralls.io/github/ShoppersShop/shop-token?branch=master)

Smart contracts for SHOP token and sale in form of [Dutch auction](https://en.wikipedia.org/wiki/Dutch_auction).

# Details

Auction duration is **30 days**, price per token unit exponentially decreases every day, all token units are being sold by the final bid price.

We're using [:page_facing_up: Pre-calculated Price Decay Rates](https://docs.google.com/spreadsheets/d/1ZqdmBoNK8sbgroBIxnbt9xCebFIfFZAtflxKLkSrplQ/edit?usp=sharing) to avoid overflows and reduce computations (and therefore, gas price) during bidding.

Auction stages:
* `AuctionDeployed`
* `AuctionSetup`
* `AuctionStarted`
* `AuctionEnded`

# Dependencies

* [Node.js](https://nodejs.org) ^9.4.0
* [Yarn](https://yarnpkg.com)

# Contributing

Thanks for considering to help out with our source code! We operate on an open
contributor model where anyone across the Internet can help in the form of peer
review, testing, and patches.

For more details about how to get involved, see our
[Contribution Guide](https://github.com/ShoppersShop/shop-token/blob/master/CONTRIBUTING.md)

# License

MIT
