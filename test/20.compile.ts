#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {compile} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    it("text", () => {
        const t = compile("foo");

        assert.equal(t(), "foo");
    });

    it("special characters", () => {
        const t = compile("\x00\t\r\n\"\\\x7f");

        assert.equal(t(), "\x00\t\r\n\"\\\x7f");
    });

    it("variable", () => {
        const t = compile("foo:{{bar}}:{{baz}}:quz");

        assert.equal(t({bar: "BAR"}), "foo:BAR::quz");
        assert.equal(t({baz: "BAZ"}), "foo::BAZ:quz");
    });

    it("section", () => {
        const t = compile("foo:{{#bar}}:baz:{{/bar}}:quz");

        assert.equal(t({bar: "BAR"}), "foo::baz::quz");
        assert.equal(t(), "foo::quz");
        assert.equal(t({bar: [1, 2, 3]}), "foo::baz::baz::baz::quz");
    });

    it("section with variable", () => {
        const t = compile("foo:{{#bar}}:{{baz}}:{{/bar}}:quz");

        assert.equal(t({bar: "BAR", baz: "BAZ"}), "foo::BAZ::quz");
        assert.equal(t({bar: [{baz: "BAZ1"}, {baz: "BAZ2"}, {baz: "BAZ3"}]}), "foo::BAZ1::BAZ2::BAZ3::quz");
    });

    it("empty section", () => {
        const t = compile("foo:{{#bar}}{{/bar}}:quz");

        assert.equal(t({bar: "BAR"}), "foo::quz");
        assert.equal(t(), "foo::quz");
    });

    it("inverted section", () => {
        const t = compile("foo:{{^bar}}:baz:{{/bar}}:quz");

        assert.equal(t({bar: "BAR"}), "foo::quz");
        assert.equal(t(), "foo::baz::quz");
    });

    it("nested section", () => {
        const t = compile("foo{{#bar}}[{{#baz}}[quz]{{/baz}}]{{/bar}}qux");

        assert.equal(t({bar: "BAR", baz: "BAZ"}), "foo[[quz]]qux");
        assert.equal(t({bar: [{baz: [1]}, {baz: [2, 3]}]}), "foo[[quz]][[quz][quz]]qux");
        assert.equal(t(), "fooqux");
    });

    it("unescaped", () => {
        const t = compile("foo:{{&bar}}:{{bar}}:{{{bar}}}:baz");

        assert.equal(t({bar: '<"&>'}), 'foo:<"&>:&lt;&quot;&amp;&gt;:<"&>:baz');
        assert.equal(t(), "foo::::baz");
    });

    it("deep variable", () => {
        const t = compile("[{{foo.bar.baz}}]");

        assert.equal(t({foo: {bar: {baz: "BAZ"}}}), "[BAZ]");
        assert.equal(t(), "[]");
    });

    it("deep variable section", () => {
        const t = compile("[{{#foo.bar.baz}}quz{{/foo.bar.baz}}]");

        assert.equal(t({foo: {bar: {baz: "BAZ"}}}), "[quz]");
        assert.equal(t({foo: {bar: {baz: false}}}), "[]");
        assert.equal(t(), "[]");
    });

    it("white space", () => {
        const t = compile("[{{# foo }}{{ bar }}{{/ foo }}]");

        assert.equal(t({foo: "FOO", bar: "BAR"}), "[BAR]");
        assert.equal(t(), "[]");
    });

    it("comment", () => {
        const t = compile("[{{! foo }}][{{! foo \n bar }}][{{! bar }}]");

        assert.equal(t(), "[][][]");
    });

    it("falsy values", () => {
        const t = compile("[{{ zero }}][{{ null }}][{{ undef }}][{{ false }}]");
        const c = {"zero": 0, "null": null as object, "false": false};

        assert.equal(t(c), "[0][][][false]");
    });
});