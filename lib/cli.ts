#!/usr/bin/env node

import * as fs from "fs";

import type {Mustatte} from "../";
import {compile, parse} from "../";

type Render = Mustatte.Render;

interface Options extends Mustatte.Options {
    "--"?: string[];
    help?: boolean;
    output?: string;
    runtime?: boolean;
    trim?: boolean;
    variable?: string;
}

interface Alt {
    loadRuntime: Render;
    package?: any;
    templates: Parsed[];
}

interface Parsed {
    code?: string;
    name?: string;
    variable?: string;
}

const argv = require("process.argv")(process.argv.slice(2));

const CONF: Options = {output: "-", variable: "templates"};

CLI(argv(CONF));

function CLI(context: Options) {
    const alt = {templates: []} as Alt;
    const args = context["--"];
    const count = +args?.length;
    const {help, output, trim, variable} = context;

    alt.package = require("../package.json");

    // --help
    if (!count || help) {
        const asset = require("../asset/asset");
        process.stderr.write(asset.help(context, alt));
        process.exit(1);
    }

    for (const file of args) {
        let source = fs.readFileSync(file, "utf-8");
        const template = {variable} as Parsed;

        // --trim
        if (trim) {
            source = source.replace(/^\s+/mg, "").replace(/\s+\n/g, "\n");
        }

        template.name = file.split("/").pop().split(".").shift();
        template.code = parse(source, context);

        alt.templates.push(template);
    }

    alt.loadRuntime = () => {
        const file = __dirname + "/../asset/runtime.min.js";
        return fs.readFileSync(file, "utf-8");
    };

    const load = (file: string) => compile(fs.readFileSync(file, "utf-8"), {tag: "[[ ]]"});
    const render = load(__dirname + "/../asset/template.txt");
    const text = render(context, alt);

    // --output=templates.js
    if (output !== "-") {
        fs.writeFileSync(output, text);
    } else {
        process.stdout.write(text);
    }
}
