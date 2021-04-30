// runtime.ts

import type {Mustatte} from "../";

type Renders = Mustatte.Renders;
type Render = Mustatte.Render;
type Context = Mustatte.Context;
type Writer = Mustatte.Writer;

const isArray = Array.isArray;

const ESCAPE_MAP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    '"': "&quot;"
} as { [chr: string]: string };

export function runtime(fn: Mustatte.RenderDef) {
    return fn(G, I, S, U, V);
}

/**
 * Group
 */

function G(items: Renders): Render {
    let GG: Render;

    return GG = (context, alt, write) => {
        if (!write) return writable(GG, context, alt);
        series(items, context, alt, write);
    }
}

/**
 * Section
 */

function S(key: string, items: Renders): Render {
    let SS: Render;
    const dig = U(key);

    return SS = (context, alt, write) => {
        if (!write) return writable(SS, context, alt);

        const cond = dig(context, alt);
        const it = (ctx: Context) => series(items, ctx, alt, write);

        if (isArray(cond)) {
            cond.forEach(it);
        } else if (cond) {
            // switch context only when an object given
            it("object" === typeof cond ? cond : context);
        }
    }
}

/**
 * Inverted Section
 */

function I(key: string, items: Renders): Render {
    let II: Render;
    const dig = U(key);
    return II = (context, alt, write) => {
        if (!write) return writable(II, context, alt);

        const cond = dig(context, alt);

        if (!cond || (isArray(cond) && !cond.length)) {
            series(items, context, alt, write);
        }
    }
}

/**
 * Variable Escaped
 */

function V(key: string): Render {
    const dig = U(key);
    return (context, alt) => esc(dig(context, alt));
}

/**
 * Variable Unescaped
 */

function U(key: string): Render {
    // {{.}}
    if (key === ".") return through as any as Render;

    const first = key[0];

    // {{.current.context.only}}
    let seeContext = (first === ".");

    // {{>alt.context.only}}
    let seeAlt = (first === ">");

    if (seeContext || seeAlt) {
        key = key.substr(1);
    } else {
        seeContext = seeAlt = true;
    }

    const keys = key.split(".");
    const last = keys.length;

    return (context, alt) => {
        let i: number;
        let parent: any;
        let val: any;

        if (seeContext) {
            for (val = context, i = 0; val && i < last;) {
                parent = val;
                val = val[keys[i++]];
            }
        }

        if (seeAlt && val == null) {
            for (val = alt, i = 0; val && i < last;) {
                parent = val;
                val = val[keys[i++]];
            }
        }

        if ("function" === typeof val) {
            return val.call(parent, context, alt);
        } else if (val != null) {
            return val;
        }
    };
}

/**
 * @private
 */

function writable(func: Render, context: Context, alt: Context): string {
    let result: string[];
    func(context, alt, write);
    return result ? result.join("") : "";

    function write(v: string) {
        if (v != null) {
            if (!result) result = [];
            result.push(v);
        }
    }
}

function series(item: (string | Render | Renders), context: Context, alt: Context, write: Writer) {
    forEach(item, it);

    function it(item: string | Render) {
        if ("function" === typeof item) {
            item = item(context, alt);
            forEach(item, it);
        } else {
            write(item);
        }
    }
}

function forEach(items: (string | Render | Renders), it: (item: string | Render) => void) {
    if (isArray(items)) {
        items.forEach(it);
    } else {
        it(items);
    }
}

function through(v: string): string {
    return v;
}

function esc(str: string): string {
    if (str == null) return;
    if ("string" !== typeof str) (str as string) += "";
    if (str.search(/["&>]/) < 0) return str;
    return str.replace(/[<"&>]/g, chr => ESCAPE_MAP[chr]);
}
