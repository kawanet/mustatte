#!/usr/bin/env bash -c make

all: lib/index.js
	make -C test/spec $@
	make -C asset $@
	make -C browser $@

clean:
	# make -C test/spec $@
	make -C asset $@
	make -C browser $@

test: all mocha
	make -C test/spec $@
	make -C asset $@
	make -C browser $@

lib/%.ts: lib/%.js
	./node_modules/.bin/tsc -p .

test/%.ts: test/%.js
	./node_modules/.bin/tsc -p .

mocha: test/10.runtime.js
	./node_modules/.bin/mocha test

.PHONY: all clean test
