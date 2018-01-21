pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./ShopToken.sol";

contract DutchAuction {
    using SafeMath for uint;

    // Auction Bid
    struct Bid {
        uint quantity;
        uint price;
        uint transfer;
        bool placed;
    }

    // Auction Stages
    enum Stages {
        AuctionDeployed,
        AuctionSetup,
        AuctionStarted,
        AuctionEnded,
        TokensDistributed
    }

    // Auction Events
    event AuctionDeployed(uint indexed priceStart, uint indexed priceDelta);
    event AuctionSetup();
    event AuctionStarted();
    event BidReceived(
        address indexed _address,
        uint quantity,
        uint price,
        uint transfer
    );
    event TokensClaimed(address indexed _address, uint amount);
    event AuctionEnded(uint priceFinal);
    event TokensDistributed();

    // Token contract reference
    ShopToken public token;

    // Current stage
    Stages public current_stage;

    // `address` ⇒ `Bid` mapping
    mapping (address => Bid) public bids;

    // Auction owner address
    address public owner_address;

    // Number of accepted bids
    uint public bids_accepted;

    // Minimum bid value in wei
    uint public minimum_bid;

    // Starting price in wei
    uint public price_start;

    // Price decay value in wei
    uint public price_decay;

    // Current price in wei
    uint public price_current;

    // Final price in wei
    uint public price_final;

    // Token unit multiplier
    uint public token_multiplier;

    // Total number of sold token units
    uint public total_units_sold;

    // Total number of token units for auction
    uint public total_token_units;

    // Stage modifier
    modifier atStage(Stages _stage) {
        require(current_stage == _stage);
        _;
    }

    // Owner modifier
    modifier isOwner() {
        require(msg.sender == owner_address);
        _;
    }

    // Constructor
    function DutchAuction(
        uint _priceStart, 
        uint _priceDecay,
        uint _minimumBid) 
        public 
    {
        // Input parameters validation
        require(_priceStart > 0);
        require(_priceDecay > 0);
        require(_priceDecay < _priceStart);
        require(_minimumBid >= 0);

        // Set auction owner address
        owner_address = msg.sender;

        // Set auction parameters
        price_start = _priceStart;
        price_current = _priceStart;
        price_decay = _priceDecay;
        minimum_bid = _minimumBid;

        // Update auction stage and fire event
        current_stage = Stages.AuctionDeployed;
        AuctionDeployed(_priceStart, _priceDecay);
    }

    // Setup auction
    function setupAuction(address _tokenAddress) public isOwner atStage(Stages.AuctionDeployed) {
        // Input parameters validation
        require(_tokenAddress != 0x0);

        // Initialize external contract type
        token = ShopToken(_tokenAddress);

        // Set the number of the token multiplier for its decimals
        token_multiplier = 10 ** uint(token.decimals());

        // Get number of token units for dutch auction
        total_token_units = token.balanceOf(address(this));

        // Set initial bid count
        bids_accepted = 0;

        // Update auction stage and fire event
        current_stage = Stages.AuctionSetup;
        AuctionSetup();
    }

    // Starts auction
    function startAuction() public isOwner atStage(Stages.AuctionSetup) {
        // Update auction stage and fire event
        current_stage = Stages.AuctionStarted;
        AuctionStarted();
    }

    // Place bid
    function placeBid() public payable atStage(Stages.AuctionStarted) {
        // Allow only a single bid per address
        require(!bids[msg.sender].placed);

        // Require minimum bid value
        require(minimum_bid < msg.value);

        // Declare local variables
        uint quantity = msg.value.div(price_current);
        uint currentPrice = price_current;

        // TODO: Handle 5% oversubscription here, instead of decreasing quantity
        if (total_units_sold.add(quantity) >= total_token_units) {
            quantity = total_token_units.sub(total_units_sold);
        }
        
        // Save bid
        Bid memory bid = Bid({
            quantity: quantity,
            price: price_current,
            transfer: msg.value,
            placed: true
        });
        bids[msg.sender] = bid;
        
        // Fire event
        BidReceived(
            msg.sender, 
            quantity, 
            price_current, 
            msg.value
        );

        // Update auction states
        total_units_sold = total_units_sold.add(quantity);
        bids_accepted = bids_accepted.add(1);
        decreasePrice();

        // End auction automatically if all token units sold
        // Set `price_final` to last bid price
        if (total_units_sold == total_token_units) {
            price_final = currentPrice;            
            current_stage = Stages.AuctionEnded;
            AuctionEnded(currentPrice);
        }
    }

    // End auction
    function endAuction() public isOwner atStage(Stages.AuctionStarted) {
        // Update auction states and fire event
        price_final = price_current;
        current_stage = Stages.AuctionEnded;
        AuctionEnded(price_current);
    }

    // View tokens to be received during claim period
    function viewTokensToReceive() public atStage(Stages.AuctionEnded) view returns (uint) {
        // Throw if no bid exists
        require(bids[msg.sender].placed);

        uint tokenCount = bids[msg.sender].transfer.div(price_final);
        return tokenCount;
    }

    // Decrease current item price
    function decreasePrice() private atStage(Stages.AuctionStarted) {
        // Define local variables
        uint priceDelta = bids_accepted.mul(price_decay);
        uint newPrice = price_start.sub(priceDelta);

        // TODO: check uint value
        if (newPrice > 0)
            price_current = newPrice;
    }
}