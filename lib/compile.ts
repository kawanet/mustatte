// compile.ts

import {runtime} from "./runtime";
import {parse} from "./parse";
import type {Mustatte} from "../";

type Compiler = Mustatte.Compiler;
type RenderDef = Mustatte.RenderDef;
type Options = Mustatte.Options;

export const compile: Compiler = (source: string | RenderDef, options?: Options) => {
    if ("function" !== typeof source) {
        const js = parse(source, options);
        source = Function("G", "I", "S", "U", "V", "return " + js) as RenderDef;
    }

    return runtime(source);
}
