// ENUMs are not yet supported as ABI type
// See https://github.com/ethereum/EIPs/issues/47
const Enum = {
  AuctionDeployed: 0,
  AuctionSetup: 1,
  AuctionStarted: 2,
  AuctionEnded: 3,
  TokensDistributed: 4
}

// Named constants for events
const AUCTION_DEPLOYED = "AuctionDeployed";
const AUCTION_SETUP = "AuctionSetup";
const AUCTION_STARTED = "AuctionStarted";
const BID_RECEIVED = "BidReceived";
const AUCTION_ENDED = "AuctionEnded";

module.exports = {
  Enum,
  AUCTION_DEPLOYED,
  AUCTION_SETUP,
  AUCTION_STARTED,
  BID_RECEIVED,
  AUCTION_ENDED,
};
