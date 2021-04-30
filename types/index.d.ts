// index.d.ts

export namespace Mustatte {
    interface Options {
        tag?: string;
    }

    interface Compiler {
        (source: string, options?: Options): Render;

        (source: RenderDef, options?: Options): Render;
    }

    interface Parser {
        (source: string, options: Options): string
    }

    type Context = any; // { [key: string]: Context | Context[] };
    type Writer = (str: string) => void;
    type Render = (context?: Context, alt?: Context, write?: Writer) => string;
    type Renders = string | Render | (string | Render)[];

    type G = (items: Renders) => Render; // Group
    type I = (key: string, items: Renders) => Render; // Inverted Section
    type S = (key: string, items: Renders) => Render; // Section
    type U = (key: string) => Render; // Variable Unescaped
    type V = (key: string) => Render; // Variable Escaped

    type RenderDef = (G: G, I: I, S: S, U: U, V: V) => Render;
}

export const compile: Mustatte.Compiler;
export const parse: Mustatte.Parser;
