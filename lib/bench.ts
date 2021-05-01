#!/usr/bin/env node

import {compile} from "../";

interface Spec {
    name: string;
    desc: string;
    data: any;
    partials: { [key: string]: string };
    template: string;
    expected: string;
}

const SPECS = {
    comments: require("../test/spec/specs/comments.json"),
    delimiters: require("../test/spec/specs/delimiters.json"),
    interpolation: require("../test/spec/specs/interpolation.json"),
    inverted: require("../test/spec/specs/inverted.json"),
    partials: require("../test/spec/specs/partials.json"),
    sections: require("../test/spec/specs/sections.json"),
    // "~lambdas": require("../test/spec/specs/~lambdas.json"),
} as { [name: string]: { tests: Spec[] } };

CLI.apply(null, process.argv.slice(2))

function CLI(counts: number) {
    if (!counts) counts = 1000;
    const start = Date.now();

    for (let i = 0; i < counts; i++) {
        Object.keys(SPECS).forEach(name => {
            SPECS[name].tests.forEach(spec => {
                const {data, template} = spec;
                const render = compile(template);
                render(data, data);
            });
        });
    }

    const end = Date.now();
    console.log(`${end - start} milliseconds / ${counts} times`);
}
