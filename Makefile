#!/usr/bin/env bash -c make

all: node_modules lib/index.js
	make -C test/spec $@
	make -C asset $@
	make -C browser $@

clean:
	/bin/rm -f lib/*.js test/*.js
	# make -C test/spec $@
	make -C asset $@
	make -C browser $@

test: all mocha
	make -C test/spec $@
	make -C asset $@
	make -C browser $@

node_modules:
	npm install

lib/%.js: lib/%.ts
	./node_modules/.bin/tsc -p .

test/%.js: test/%.ts
	./node_modules/.bin/tsc -p .

mocha: test/10.runtime.js
	./node_modules/.bin/mocha test

.PHONY: all clean test
