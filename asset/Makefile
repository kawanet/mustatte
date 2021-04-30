#!/usr/bin/env bash -c make

ALL=../asset/runtime.min.js ../asset/help.js

all: $(ALL)

test: all
	node ../lib/cli.js --help 2>&1 | grep github.com > /dev/null
	node ../lib/cli.js ../test/sample/*.html | node

clean:
	/bin/rm -fr $(ALL) build/

../asset/runtime.min.js: ../build/runtime.js
	../node_modules/.bin/terser -e exports:exports -c -m -o $@ $<

../build/runtime.js: ../lib/runtime.ts
	../node_modules/.bin/tsc -p ../asset
	perl -i -pe 's#^ *("use strict"|Object.defineProperty.*"__esModule"|(exports.* =)+ void 0)#// $$&#mg' $@

../asset/help.js: ../asset/help.txt ../asset/runtime.min.js
	node ../lib/cli.js --variable=exports --tag="[[ ]]" --runtime ../asset/help.txt --output=$@

.PHONY: all clean test
