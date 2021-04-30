#!/usr/bin/env mocha -R spec

import * as fs from "fs";
import {strict as assert} from "assert";
import {compile} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const sample1 = fs.readFileSync(__dirname + "/sample/sample1.html", "utf-8");
    const sample2 = fs.readFileSync(__dirname + "/sample/sample2.html", "utf-8");

    const context1 = {list: [{name: "foo"}, {name: "bar"}]};
    const context2 = {list: {name: "foo"}};
    const context3 = {list: true, name: "foo"};

    const expect1 = '<ul>\n  <li>foo</li>\n  <li>bar</li>\n</ul>';
    const expect2 = '<ul>\n  <li>foo</li>\n</ul>';
    const expect3 = '<ul>\n</ul>';

    it("{{ tag }}", () => {
        const render = compile(sample1);
        assert.equal(render(context1), expect1);
        assert.equal(render(context2), expect2);
        assert.equal(render(context3), expect2);
        assert.equal(render(), expect3);
    });

    it('<% tag %>', () => {
        const render = compile(sample2, {tag: "<% %>"});
        assert.equal(render(context1), expect1);
        assert.equal(render(context2), expect2);
        assert.equal(render(context3), expect2);
        assert.equal(render(), expect3);
    });

    it("{{= <% %> =}} <% tag %>", () => {
        const render = compile("{{= <% %> =}}" + sample2);
        assert.equal(render(context1), expect1);
        assert.equal(render(context2), expect2);
        assert.equal(render(context3), expect2);
        assert.equal(render(), expect3);
    });

    it("{{ tag }} {{= <% %> =}} <% tag %>", () => {
        const render = compile(sample1 + "{{= <% %> =}}" + sample2);
        assert.equal(render(context1), expect1 + expect1);
        assert.equal(render(context2), expect2 + expect2);
        assert.equal(render(context3), expect2 + expect2);
        assert.equal(render(), expect3 + expect3);
    });

    it("<% tag %> {{= <% %> =}} {{ tag }}", () => {
        const render = compile(sample2 + "{{= <% %> =}}" + sample1);
        assert.equal(render(context1), sample2 + sample1);
        assert.equal(render(context2), sample2 + sample1);
        assert.equal(render(context3), sample2 + sample1);
        assert.equal(render(), sample2 + sample1);
    });
});
