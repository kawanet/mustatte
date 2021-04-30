#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {runtime} from "../lib/runtime";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    runtime((G, I, S, U, V) => {

        it("text", () => {
            const t = G("Hello, Mustatte!");
            assert.equal(t(), "Hello, Mustatte!");
        });

        it("text fragment", () => {
            const t = G(["Hello, ", null, undefined, "Mustatte!"]);
            assert.equal(t(), "Hello, Mustatte!");
        });

        it("variable", () => {
            const t = V("name");
            assert.equal(t({"name": "Mustatte"}), "Mustatte");
        });

        it("text and variable", () => {
            const t = G(["Hello, ", V("name"), "!"]);
            assert.equal(t({"name": "Mustatte"}), "Hello, Mustatte!");
            assert.equal(t(), "Hello, !");
        });

        it("section", () => {
            const t = G([S("foo", "FOO"), S("bar", "BAR")]);
            assert.equal(t({"foo": true, "bar": false}), "FOO");
            assert.equal(t(), "");
        });

        it("inverted section", () => {
            const t = G([I("foo", "FOO"), I("bar", "BAR")]);
            assert.equal(t({"foo": true, "bar": false}), "BAR");
            assert.equal(t(), "FOOBAR");
        });

        it("escape", () => {
            const t = G([V("amp"), "<&>", U("amp")]);
            assert.equal(t({"amp": "<&>"}), "&lt;&amp;&gt;<&><&>");
            assert.equal(t(), "<&>");
        });

        it("deep variable", () => {
            const t = G(["[", V("aa.bb.cc"), "]"]);

            assert.equal(t({aa: {bb: {cc: "DD"}}}), "[DD]");
            assert.equal(t({aa: {bb: {}}}), "[]");
            assert.equal(t({aa: {}}), "[]");
            assert.equal(t(), "[]");
        });

        it("lambda", () => {
            const t = G(V("aa.bb"));

            const context = {aa: {bb: bb}};
            const alt = {alt: 1};

            assert.equal(t(context, alt), "AABB");

            function bb(this: any, ctx: any, second: any) {
                assert.deepEqual(this, context.aa);
                assert.deepEqual(ctx, context);
                assert.deepEqual(second, alt);
                return "AABB";
            }
        });

        it("partial", () => {
            const t = G(["[", V("foo"), ":", U(">foo"), "]"]);
            const context = {foo: "context"};
            const alt = {foo: foo};

            assert.equal(t(context, alt), "[context:alt]");

            function foo(this: any, ctx: any, second: any) {
                assert.deepEqual(this, alt);
                assert.deepEqual(ctx, context);
                assert.deepEqual(second, alt);
                return "alt";
            }
        });

        it("section and partial", () => {
            const t = G(["[ ", S("foo", ["[", U(">baz"), "]"]), " ]"]);
            const bar = {};
            const context = {foo: [bar, bar], baz: "context"};
            const alt = {baz: baz};

            assert.equal(t(context, alt), "[ [alt][alt] ]");

            function baz(ctx: any, second: any) {
                assert.deepEqual(ctx, bar);
                assert.deepEqual(second, alt);
                return "alt";
            }
        });

        return void 0;
    });
});
