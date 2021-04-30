// compile.ts

import {runtime} from "./runtime";
import {parse} from "./parse";
import type {Mustatte} from "../";

type Options = Mustatte.Options;
type Render = Mustatte.Render;
type RenderDef = Mustatte.RenderDef;

export function compile(source: string, options?: Options): Render {
    const js = parse(source, options);
    const fn = Function("G", "I", "S", "U", "V", "return " + js) as RenderDef;
    return runtime(fn);
}
