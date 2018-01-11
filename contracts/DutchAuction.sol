pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './ShopToken.sol';

contract DutchAuction {

    ShopToken public token;
    Stages public stage;

    enum Stages {
        AuctionDeployed,
        AuctionSetUp,
        AuctionStarted,
        AuctionEnded,
        TokensDistributed
    }

    function DutchAuction() public {
        stage = Stages.AuctionDeployed;
    }
}