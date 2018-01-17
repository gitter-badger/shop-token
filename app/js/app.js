App = {
  web3Provider: null,
  contracts: {},
  multiplier: Math.pow(10, 18),

  init: function () {
    return App.initWeb3();
  },

  // Init Web3 Provider
  initWeb3: function () {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  // Init contract
  initContract: function () {
    $.getJSON('DutchAuction.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var DutchAuctionArtifact = data;
      App.contracts.DutchAuction = TruffleContract(DutchAuctionArtifact);

      // Set the provider for our contract
      App.contracts.DutchAuction.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.showSupply();
    });

    return App.bindEvents();
  },

  // Bind events
  bindEvents: function () {
    $(document).on('click', '#btn-refresh', App.handleRefresh);
  },

  // Show supplies in the middle of the page
  showSupply: async function (token, account) {
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const auctionSupplyWei = await auctionContract.total_token_units.call();
    const auctionSupply = await web3.fromWei(auctionSupplyWei);

    console.log("Dutch auction supply:", auctionSupply);
    $('#info-auction-supply').html(auctionSupply.toFormat());
  },

  // Handle click on `Refresh` button
  handleRefresh: function (event) {
    event.preventDefault();
    App.showSupply();
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
