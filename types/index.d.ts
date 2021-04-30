// index.d.ts

export namespace Mustatte {
    interface Options {
        tag?: string;
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

export function compile(source: string, options?: Mustatte.Options): Mustatte.Render;

export function parse(source: string, options?: Mustatte.Options): string
