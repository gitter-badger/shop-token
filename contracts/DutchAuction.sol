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
    event AuctionDeployed(uint indexed priceStart);
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

    // Starting price in wei
    uint public price_start;

    // Final price in wei
    uint public price_final;

    // Token unit multiplier
    uint public token_multiplier;

    // Total number of sold token units
    uint public total_units_sold;

    // Total number of token units for auction
    uint public total_token_units;

    // Auction start time
    uint public start_time;

    // Auction duration, in days
    uint public duration = 30;

    // Precision for price calculation
    uint public precision = 10 ** 13;

    // Price decay rates per day
    uint[30] public rates = [
        precision,
        7694472807310,
        5920491178244,
        4555505837691,
        3505221579166,
        2697083212449,
        2075263343724,
        1596805736629,
        1228657831905,
        945387427708,
        727425785487,
        559715792577,
        430671794580,
        331379241228,
        254978856053,
        196192787434,
        150960006790,
        116155766724,
        89375738847,
        68769919219,
        52914827339,
        40715170006,
        31328176846,
        24105380484,
        18547819465,
        14271569251,
        10981220152,
        8449469985,
        6501421703,
        5002501251
    ];    

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
    function DutchAuction(uint _priceStart) public {
        // Input parameters validation
        require(_priceStart > 0);

        // Set auction owner address
        owner_address = msg.sender;

        // Set auction parameters
        price_start = _priceStart;
        price_final = _priceStart;

        // Update auction stage and fire event
        current_stage = Stages.AuctionDeployed;
        AuctionDeployed(_priceStart);
    }

    // Fallback function
    function () public payable atStage(Stages.AuctionStarted) {
        placeBid();
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

        // Update auction stage and fire event
        current_stage = Stages.AuctionSetup;
        AuctionSetup();
    }

    // Starts auction
    function startAuction() public isOwner atStage(Stages.AuctionSetup) {
        // Update auction stage and fire event
        current_stage = Stages.AuctionStarted;
        start_time = block.timestamp;
        AuctionStarted();
    }

    // Place bid
    function placeBid() public payable atStage(Stages.AuctionStarted) {
        // Allow only a single bid per address
        require(!bids[msg.sender].placed);

        // Declare local variables
        uint currentDays = getDays();
        uint currentPrice = getPrice();

        // Automatically end auction
        if (currentDays > duration) {       
            current_stage = Stages.AuctionEnded;
            AuctionEnded(price_final);
        }

        // TODO: Handle 5% oversubscription here, instead of decreasing quantity
        uint quantity = msg.value.div(currentPrice);        
        if (total_units_sold.add(quantity) >= total_token_units) {
            quantity = total_token_units.sub(total_units_sold);
        }
        
        // Save last price
        if (currentPrice != price_final) {
            price_final = currentPrice;
        }
        
        // Save bid
        Bid memory bid = Bid({
            quantity: quantity,
            price: currentPrice,
            transfer: msg.value,
            placed: true
        });
        bids[msg.sender] = bid;
        
        // Fire event
        BidReceived(
            msg.sender, 
            quantity, 
            currentPrice, 
            msg.value
        );

        // Update auction states
        total_units_sold = total_units_sold.add(quantity);

        // End auction automatically if all token units sold
        // Set `price_final` to last bid price
        if (total_units_sold == total_token_units) {         
            current_stage = Stages.AuctionEnded;
            AuctionEnded(price_final);
        }
    }

    // End auction
    function endAuction() public isOwner atStage(Stages.AuctionStarted) {
        // Update auction states and fire event
        price_final = getPrice();
        current_stage = Stages.AuctionEnded;
        AuctionEnded(price_final);
    }

    // View tokens to be received during claim period
    function viewTokensToReceive() public atStage(Stages.AuctionEnded) view returns (uint) {
        // Throw if no bid exists
        require(bids[msg.sender].placed);

        uint tokenCount = bids[msg.sender].transfer.div(price_final);
        return tokenCount;
    }

    // Returns days passed
    function getDays() public atStage(Stages.AuctionStarted) view returns (uint) {
        return block.timestamp.sub(start_time).div(86400);
    }

    // Returns current price
    function getPrice() public atStage(Stages.AuctionStarted) view returns (uint) {
        uint _day = getDays();
        if (_day > 29) {
            _day = 29;
        }

        return price_start * rates[_day] / precision;
    }
}