// 50.parse.ts

import {strict as assert} from "assert";
import {compile, parse} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    {
        const src = ``;
        it(JSON.stringify(src), () => {
            const fn = parse(src);
            assert.equal(fn, `G([])`);

            const render = compile(src);
            assert.equal(typeof render(), "string");
        });
    }

    {
        const src = `{{foo}}`;
        it(src, () => {
            const fn = parse(src);
            assert.equal(fn, `G([V("foo")])`);

            const render = compile(src);
            assert.equal(render({foo: "FOO"}), "FOO");
        });
    }

    {
        const src = `{{#bar}}{{buz}}{{/bar}}`;
        it(src, () => {
            const fn = parse(src);
            assert.equal(fn, `G([S("bar",[V("buz")])])`);

            const render = compile(src);
            assert.equal(render({bar: true, buz: "BUZ"}), "BUZ");
            assert.equal(render({bar: false}), "");
            assert.equal(render({bar: [{buz: 1}, {buz: 2}]}), "12");
        });
    }

    {
        const src = `{{^bar}}{{buz}}{{/bar}}`;
        it(src, () => {
            const fn = parse(src);
            assert.equal(fn, `G([I("bar",[V("buz")])])`);

            const render = compile(src);
            assert.equal(render({bar: true}), "");
            assert.equal(render({bar: false, buz: "BUZ"}), "BUZ");
            assert.equal(render({bar: [], buz: "BUZ"}), "BUZ");
        });
    }

    {
        const src = `{{foo}}{{#bar}}{{buz}}{{/bar}}{{qux}}`;
        it(src, () => {
            const fn = parse(src);
            assert.equal(fn, `G([V("foo"),S("bar",[V("buz")]),V("qux")])`);

            const render = compile(src);
            assert.equal(render(), "");
            assert.equal(render({foo: "FOO", qux: "QUX"}), "FOOQUX");
            assert.equal(render({bar: true, buz: "BUZ"}), "BUZ");
        });
    }
});