#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {compile} from "../";
import type {Mustatte} from "../";

type Render = Mustatte.Render;

const TITLE = __filename.split("/").pop();
const ONLY = process.env.ONLY;

interface Spec {
    name: string;
    desc: string;
    data: any;
    partials: { [key: string]: string };
    template: string;
    expected: string;
}

const SKIP_NAME = {
    //
} as { [key: string]: number };

const SKIP_DESC = {
    "A lambda's return value should be parsed.": 1, // evil
    "A lambda's return value should parse with the default delimiters.": 1,
    "All elements on the context stack should be accessible.": 1, // evil
    "All elements on the context stack should be accessible within lists.": 1,
    "Lambdas used for inverted sections should be considered truthy.": 1, // nonsense
    "Lambdas used for sections should have their results parsed.": 1,
    "Lambdas used for sections should not be cached.": 1,
    "Lambdas used for sections should parse with the current delimiters.": 1,
    "Lambdas used for sections should receive the raw section string.": 1,
    "Names missing in the current context are looked up in the stack.": 1,
    "Non-false sections have their value at the top of context,\naccessible as {{.}} or through the parent context. This gives\na simple way to display content conditionally if a variable exists.\n": 1
} as { [key: string]: number };

const SPECS = {
    comments: require("./spec/specs/comments.json"),
    delimiters: require("./spec/specs/delimiters.json"),
    interpolation: require("./spec/specs/interpolation.json"),
    inverted: require("./spec/specs/inverted.json"),
    partials: require("./spec/specs/partials.json"),
    sections: require("./spec/specs/sections.json"),
    "~lambdas": require("./spec/specs/~lambdas.json"),
} as { [name: string]: { tests: Spec[] } };

describe(TITLE, function () {
    Object.keys(SPECS).forEach(name => {
        describe(name, () => {
            SPECS[name].tests.forEach(test => {
                const name = test.name;
                const desc = test.desc;
                const context = test.data;
                const partials = test.partials;
                const template = test.template;
                const lambda = context.lambda && context.lambda.js;

                if (ONLY && name.indexOf(ONLY) < 0 && desc.indexOf(ONLY) < 0) return;

                const partialHasIndent = (template.search(/^[ \t]+{{>/m) > -1);

                if (SKIP_NAME[name] || SKIP_DESC[desc] || partialHasIndent) {
                    return it.skip(name + ": " + desc);
                }

                it(name, function () {
                    let t: Render;
                    try {
                        t = compile(template);
                    } catch (e) {
                        console.warn(template);
                        return assert.fail(e);
                    }

                    const partial = {} as { [name: string]: Render };

                    if (partials) {
                        Object.keys(partials).forEach(function (name) {
                            partial[name] = compile(partials[name]);
                        });
                    }

                    if (lambda) {
                        context.lambda = (Function("return " + lambda)());
                    }

                    const result = t(context, partial);
                    assert.equal(result, test.expected, desc);
                });
            });
        });
    });
});
