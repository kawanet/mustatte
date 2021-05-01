// index.d.ts

export namespace Mustatte {
    interface Options {
        tag?: string;
    }

    type Render = (context?: any, alt?: any) => string;
    type Item = string | Render;

    type G = (items: Item | Item[]) => Render; // Group
    type I = (key: string, items: Item | Item[]) => Render; // Inverted Section
    type S = (key: string, items: Item | Item[]) => Render; // Section
    type U = (key: string) => Render; // Variable Unescaped
    type V = (key: string) => Render; // Variable Escaped

    type RenderDef = (G: G, I: I, S: S, U: U, V: V) => Render;
}

// compile template string to render function
export function compile(source: string, options?: Mustatte.Options): Mustatte.Render;

// compile template string to template function
export function parse(source: string, options?: Mustatte.Options): string;

// apply mustatte runtime to pre-compiled template function
export function runtime(def: Mustatte.RenderDef): Mustatte.Render;
