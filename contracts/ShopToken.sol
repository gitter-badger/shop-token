pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract ShopToken is StandardToken {
    /*
     * Token metadata
     * 1 token unit = Shei
     * 1 token = SHOP = Shei * 10^18
     */
    string public name = "SHOP Token";
    string public symbol = "SHOP";
    uint8 public decimals = 18;
    uint private MULTIPLIER = 10 ** uint(decimals);

    // Original mint - 1MM tokens
    uint public TOKENS_MINTED = 1000 * 1000 * 1000;
    uint public INITIAL_SUPPLY = MULTIPLIER.mul(TOKENS_MINTED);

    // Private token sale metadata
    // Allocate 100M tokens for sale
    uint public PRIVATE_SALE_TOKEN_COUNT = 100 * 1000 * 1000;
    uint public PRIVATE_SALE_SUPPLY = MULTIPLIER.mul(PRIVATE_SALE_TOKEN_COUNT);

    function ShopToken(address privateSaleAddress) public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        transfer(privateSaleAddress, PRIVATE_SALE_SUPPLY);
    }
}