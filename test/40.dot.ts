#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {compile} from "../";
import type {Mustatte} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, function () {
    runTest();
});

function runTest(options?: Mustatte.Options) {
    const context = {
        foo: {foo: "FOO", bar: ["B", "A", "R"], buz: "BUZ"},
        qux: "QUX",
        "": {bar: "bar"}
    };

    const alt = {
        foo: {foo: "111", bar: "222", buz: "333", qux: "444"},
        bar: "555",
        buz: "666",
        qux: "777",
        "": {bar: "888"}
    };

    test("{{#foo}}[{{buz}}]{{/foo}}", "[BUZ]"); // look both
    test("{{#foo}}[{{.buz}}]{{/foo}}", "[BUZ]"); // look local context only
    test("{{#foo}}[{{>buz}}]{{/foo}}", "[666]"); // look alt only

    test("{{#foo}}[{{foo.buz}}]{{/foo}}", "[333]");

    test("{{#foo}}[{{qux}}]{{/foo}}", "[777]");
    test("{{#foo}}[{{.qux}}]{{/foo}}", "[]");
    test("{{#foo}}[{{>qux}}]{{/foo}}", "[777]");

    test("{{#foo}}[{{foo.foo}}]{{/foo}}", "[111]");
    test("{{#foo}}[{{.foo}}]{{/foo}}", "[FOO]");
    test("{{#foo}}[{{>foo.foo}}]{{/foo}}", "[111]");

    test("{{#foo}}[{{#.}}[{{buz}}]{{/.}}]{{/foo}}", "[[BUZ]]");
    test("{{#foo}}[{{#.}}[{{qux}}]{{/.}}]{{/foo}}", "[[777]]");

    test("{{#foo.bar}}[{{.}}]{{/foo.bar}}", "[B][A][R]");
    test("{{#foo}}[{{#bar}}[{{.}}]{{/bar}}]{{/foo}}", "[[B][A][R]]");
    test("{{#foo}}[{{#qux}}[{{foo}}]{{/qux}}]{{/foo}}", "[[FOO]]");

    function test(template: string, expected: string) {
        it(template, () => {
            const t = compile(template, options);
            const result = t(context, alt);
            assert.equal(result, expected);
        });
    }
}
