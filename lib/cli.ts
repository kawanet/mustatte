#!/usr/bin/env node

import type {Mustatte} from "../";
import * as fs from "fs";
import {compile, parse} from "../";

interface Options extends Mustatte.Options {
    "--"?: string[];
    package?: any;
    help?: boolean;
    trim?: boolean;
    name?: string;
    code?: string;
    runtime?: boolean;
    output?: string;
}

type RenderIndex = { [name: string]: Mustatte.Render };

const argv = require("process.argv")(process.argv.slice(2));

const CONF = {variable: "templates"};

const SRC = {
    header: 'if (!!![[variable]]) var [[variable]] = {};\n',
    runtime: '\n!function(r,t){' +
        '!function(exports){[[>loadRuntime]]}(r);' +
        'Object.keys(t).forEach(function(k){const o=t[k];t[k]=function(c,a){return(t[k]=r.runtime(o))(c,a)}})' +
        '}({},[[variable]]);\n',
    line: '[[variable]]["[[namespace]][[name]]"] = function(G,I,S,U,V){return [[&code]]};\n',
    footer: ''
} as { [name: string]: string };

CLI(argv(CONF));

function CLI(context: Options) {
    const options: Options = {tag: "[[ ]]"};
    const renders: RenderIndex = {};

    Object.keys(SRC).forEach(function (key) {
        renders[key] = compile(SRC[key], options);
    });

    context.package = require("../package.json");

    const args = context["--"];
    const count = args && args.length;

    // --help
    if (!count || context.help) {
        const templates = require("../asset/help");
        process.stderr.write(templates.help(context, renders));
        process.exit(1);
    }

    const result = [];
    result.push(renders.header(context));

    for (const file of args) {
        let source = fs.readFileSync(file, "utf-8");

        // --trim
        if (context.trim) {
            source = source.replace(/^\s+/mg, "").replace(/\s+\n/g, "\n");
        }

        context.name = file.split("/").pop().split(".").shift();
        context.code = parse(source, context);

        result.push(renders.line(context));
    }

    // --runtime
    const runtime = context.runtime;
    if (runtime) {
        const file = __dirname + "/../asset/runtime.min.js";
        renders.loadRuntime = lazyLoader(file);
        result.push(renders.runtime(context, renders));
    }

    result.push(renders.footer(context));

    const text = result.join("");

    // --output=templates.js
    if (context.output) {
        fs.writeFileSync(context.output, text);
    } else {
        process.stdout.write(text);
    }

    function lazyLoader(file: string) {
        return () => fs.readFileSync(file, "utf-8");
    }
}
