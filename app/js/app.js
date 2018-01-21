App = {
  web3Provider: null,
  contracts: {},
  multiplier: Math.pow(10, 18),
  stagesEnum: {
    AuctionDeployed: 0,
    AuctionSetup: 1,
    AuctionStarted: 2,
    AuctionEnded: 3,
    TokensDistributed: 4
  },
  stageNames: {
    0: "Deployed",
    1: "Setup",
    2: "Started",
    3: "Ended",
    4: "Tokens Distributed",
  },

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
    $.getJSON('ShopToken.json', function (data) {
      console.log("Loading `ShopToken` artifact");
      App.contracts.ShopToken = TruffleContract(data);
      App.contracts.ShopToken.setProvider(App.web3Provider);
      return true;
    });

    $.getJSON('DutchAuction.json', function (data) {
      console.log("Loading `DutchAuction` artifact");
      App.contracts.DutchAuction = TruffleContract(data);
      App.contracts.DutchAuction.setProvider(App.web3Provider);
      return App.showStatus();
    });

    return App.bindEvents();
  },

  // Bind events
  bindEvents: function () {
    $(document).on('click', '#btn-refresh', App.handleRefresh);
    $(document).on('click', '#btn-setup', App.handleSetup);
    $(document).on('click', '#btn-start', App.handleStart);
    $(document).on('click', '#btn-end', App.handleEnd);
  },

  // Show supplies in the middle of the page
  showStatus: async function (token, account) {
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const auctionStage = await auctionContract.current_stage.call();
    App.stageHandler(auctionStage.toNumber());
  },

  stageHandler: async function (currentStage) {
    // Show stage name
    const stageName = App.stageNames[currentStage];
    $('#info-auction-stage').html(stageName);

    // Hide all stage buttons and info wrappers
    $('.wrapper').hide();
    $('.btn-stage').hide();

    // Show buttons
    switch (currentStage) {
      case 0: // Deployed
        $('#btn-setup').show();
        break;
      case 1: // Setup
        App.showAvailableTokens();
        $('#btn-start').show();
        break;
      case 2: // Started
        App.showAvailableTokens();
        App.showCurrentPrice();
        $('#btn-end').show();
        break;
      case 3: // Ended
        App.showFinalPrice();
        break;
    }
  },

  // Show available tokens
  showAvailableTokens: async function () {
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const auctionSupplyWei = await auctionContract.total_token_units.call();
    const auctionSupply = await web3.fromWei(auctionSupplyWei);
    $('#info-auction-supply').html(auctionSupply.toFormat());
    $('#wrapper-auction-supply').show();
  },

  // Shows current token price
  showCurrentPrice: async function () {
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const tokenPriceWei = await auctionContract.price_current.call();
    $('#info-current-price').html(tokenPriceWei.toFormat());
    $('#wrapper-current-price').show();
  },

  // Shows final auction price
  showFinalPrice: async function () {
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const tokenPriceWei = await auctionContract.price_final.call();
    $('#info-final-price').html(tokenPriceWei.toFormat());
    $('#wrapper-final-price').show();
  },

  // Setup auction
  setupAuction: async function (event) {
    const tokenContract = await App.contracts.ShopToken.deployed();
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const result = await auctionContract.setupAuction(tokenContract.address);
    console.log("Setup auction", result);
  },

  // Start auction
  startAuction: async function (event) {
    const tokenContract = await App.contracts.ShopToken.deployed();
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const result = await auctionContract.startAuction();
    console.log("Start auction", result);
  },

  // End auction
  endAuction: async function (event) {
    const tokenContract = await App.contracts.ShopToken.deployed();
    const auctionContract = await App.contracts.DutchAuction.deployed();
    const result = await auctionContract.endAuction();
    console.log("End auction", result);
  },

  // Handle setup
  handleSetup: function (event) {
    event.preventDefault();
    App.setupAuction();
    App.showStatus();
  },

  // Handle setup
  handleStart: function (event) {
    event.preventDefault();
    App.startAuction();
    App.showStatus();
  },

  // Handle end
  handleEnd: function (event) {
    event.preventDefault();
    App.endAuction();
    App.showStatus();
  },

  // Handle click on `Refresh` button
  handleRefresh: function (event) {
    event.preventDefault();
    App.showStatus();
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
