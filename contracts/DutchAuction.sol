pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./ShopToken.sol";

contract DutchAuction {

    // Auction Stages
    enum Stages {
        AuctionDeployed,
        AuctionSetup,
        AuctionStarted,
        AuctionEnded,
        TokensDistributed
    }

    // Auction Events
    event AuctionDeployed(
        uint indexed _priceStart,
        uint indexed _priceConstant,
        uint32 indexed _priceExponent
    );
    event AuctionSetup();
    event AuctionStarted(uint indexed _startTime);
    event BidSubmission(
        address indexed _sender,
        uint _amount,
        uint _missingFunds
    );
    event TokensClaimed(address indexed _recipient, uint _sentAmount);
    event AuctionEnded(uint _priceFinal);
    event TokensDistributed();

    // Token contract reference
    ShopToken public token;

    // Current stage
    Stages public current_stage;

    // `address` ⇒ `bid value` mapping
    mapping (address => uint) public bids;

    // Auction owner address
    address public owner_address;

    // Auction start time
    uint public start_time;

    // Auction end time
    uint public end_time;

    // Starting price in token units
    uint public price_start;

    // Divisor constant
    uint public price_constant;

    // Divisor exponent
    uint32 public price_exponent;

    // Final price in token units
    uint public price_final;

    // Token unit multiplier
    uint public token_multiplier;

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
        uint _priceConstant, 
        uint32 _priceExponent) 
        public 
    {
        // Input parameters validation
        require(_priceStart > 0);
        require(_priceConstant > 0);

        // Set auction owner address
        owner_address = msg.sender;

        // Set auction parameters
        price_start = _priceStart;
        price_constant = _priceConstant;
        price_exponent = _priceExponent;

        // Update auction stage and fire event
        current_stage = Stages.AuctionDeployed;
        AuctionDeployed(_priceStart, _priceConstant, _priceExponent);
    }

    // Setup auction
    function setup(address _tokenAddress) public isOwner atStage(Stages.AuctionDeployed) {
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
    function start() public isOwner atStage(Stages.AuctionSetup) {
        // Set auction start time
        start_time = block.timestamp;

        // Update auction stage and fire event
        current_stage = Stages.AuctionStarted;
        AuctionStarted(start_time);
    }

    // Finalizes auction
    // @TODO - Calculate final price
    function finalize() public atStage(Stages.AuctionStarted) {
        // Set auction end time
        end_time = block.timestamp;
        
        // Calculate final price
        price_final = 1;

        // Update auction stage and fire event
        current_stage = Stages.AuctionEnded;
        AuctionEnded(price_final);
    }    
}