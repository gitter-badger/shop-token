BIN=./node_modules/.bin

clean:
	rm -rf build node_modules

install:
	yarn install --save-dev

build:
	$(BIN)/truffle compile

migrate:
	$(BIN)/run-with-testrpc --testrpc-cmd $(BIN)/ganache-cli '$(BIN)/truffle migrate'

test:
	$(BIN)/run-with-testrpc --testrpc-cmd $(BIN)/ganache-cli '$(BIN)/truffle test'

.PHONY: clean install build migrate test