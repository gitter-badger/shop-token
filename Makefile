BIN=./node_modules/.bin

clean:
	rm -rf ./build ./node_modules
	rm -rf ./coverage ./coverage.json

install:
	yarn install --save-dev

build:
	$(BIN)/truffle compile

lint:
	$(BIN)/solium -d contracts/

migrate:
	$(BIN)/run-with-testrpc --testrpc-cmd $(BIN)/ganache-cli '$(BIN)/truffle migrate'

test:
	$(BIN)/run-with-testrpc --testrpc-cmd $(BIN)/ganache-cli '$(BIN)/truffle test'

coverage:
	$(BIN)/solidity-coverage

run:
	$(BIN)/nf start

.PHONY: clean install build lint migrate test coverage run