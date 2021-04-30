#!/usr/bin/env bash -c make

ALL=\
	specs/comments.json \
	specs/delimiters.json \
	specs/interpolation.json \
	specs/inverted.json \
	specs/partials.json \
	specs/sections.json \
	specs/~lambdas.json \

all: $(ALL)

clean:
	/bin/rm -f $(ALL)

specs/%.json:
	curl -o $@ "https://raw.githubusercontent.com/mustache/spec/master/$@"

test:
	# none
