// runtime.ts

import type {Mustatte} from "../";

type RenderDef = Mustatte.RenderDef;
type Render = Mustatte.Render;
type Item = Mustatte.Item;
type Context = any; // { [key: string]: Context | Context[] };

const isArray = Array.isArray;

const ESCAPE_MAP = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    '"': "&quot;"
} as { [chr: string]: string };

export function runtime(fn: RenderDef): Render {
    return fn(G, I, S, U, V);
}

/**
 * Group
 */

function G(items: Item | Item[]): Render {
    return (context, alt) => render(items, context, alt);
}

/**
 * Section
 */

function S(key: string, items: Item | Item[]): Render {
    const dig = U(key);

    return (context, alt) => {
        const cond = dig(context, alt);

        if (isArray(cond)) {
            return series(items, cond, alt);
        } else if (cond) {
            // switch context only when an object given
            const ctx = ("object" === typeof cond) ? cond : context;
            return render(items, ctx, alt);
        }
    };
}

/**
 * Inverted Section
 */

function I(key: string, items: Item | Item[]): Render {
    const dig = U(key);

    return (context, alt) => {
        const cond = dig(context, alt);

        // Empty lists should behave like falsey values.
        // Lists should behave like truthy values.
        if (!cond || (isArray(cond) && !cond.length)) {
            return render(items, context, alt);
        }
    };
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

function series(items: Item | Item[], contexts: Context[], alt: Context): string {
    let result: string[];
    contexts.forEach(it);
    return result ? result.join("") : "";

    function it(ctx: Context) {
        const v = render(items, ctx, alt);
        if (v != null) {
            if (!result) result = [];
            result.push(v);
        }
    }
}

function render(items: Item | Item[], context: Context, alt: Context): string {
    let result: string[];
    if (isArray(items)) {
        items.forEach(it);
    } else {
        it(items);
    }
    return result ? result.join("") : "";

    function it(item: Item) {
        if ("function" === typeof item) {
            item = item(context, alt);
        }

        if (item != null) {
            if (!result) result = [];
            result.push(item);
        }
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
