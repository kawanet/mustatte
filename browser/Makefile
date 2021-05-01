#!/usr/bin/env bash -c make

all: ../dist/mustatte.min.js ../build/test.js

clean:
	/bin/rm -fr ../dist/mustatte.min.js ../build/

test: all
	# open test.html

../build/test.js: ../test/*.js
	../node_modules/.bin/browserify -o $@ ../test/*.js -t [ brfs ] \
		-t [ browserify-sed 's#require\("../"\)#require("../browser/import")#' ]

../dist/mustatte.min.js: ../build/mustatte.bundle.js
	mkdir -p ../dist/
	../node_modules/.bin/terser -c -m -o $@ $<

../build/mustatte.bundle.js: ../build/mustatte.amd.js wrap.js
	grep -v "// END" wrap.js > $@
	cat $< >> $@
	grep "// END" wrap.js >> $@

../build/mustatte.amd.js: ../lib/*.ts
	../node_modules/.bin/tsc -p ../browser
	perl -i -pe 's#^ *("use strict"|Object.defineProperty.*"__esModule"|(exports.* =)+ void 0)#// $$&#mg' $@

.PHONY: all clean test
