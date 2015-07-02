#!/usr/bin/env bash -c make

SRC=./promisen.js
TESTS=./test/*.js
DIST=./dist
DEST=./dist/promisen.min.js
JSHINT=./node_modules/.bin/jshint
UGLIFYJS=./node_modules/.bin/uglifyjs
MOCHA=./node_modules/.bin/mocha

all: $(DEST)

clean:
	rm -fr $(DEST)

$(DIST):
	mkdir $(DIST)

$(DEST): $(SRC) $(DIST)
	$(UGLIFYJS) $(SRC) -c -m -o $(DEST)

test: all jshint mocha

mocha:
	$(MOCHA) -R spec $(TESTS)

jshint:
	$(JSHINT) $(SRC) $(TESTS)

.PHONY: all clean test jshint mocha
