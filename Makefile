BIN=./node_modules/.bin

clean:
	rm -rf build node_modules

install:
	yarn install --save-dev

build:
	$(BIN)/truffle compile

lint:
	$(BIN)/solium -d contracts/

migrate:
	# Note: being used for testing purposes only
	$(BIN)/run-with-testrpc --testrpc-cmd $(BIN)/ganache-cli '$(BIN)/truffle migrate'

test:
	$(BIN)/run-with-testrpc --testrpc-cmd $(BIN)/ganache-cli '$(BIN)/truffle test'

run:
	$(BIN)/nf start

.PHONY: clean install build lint migrate test run