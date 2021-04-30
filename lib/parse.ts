// parse.ts

import type {Mustatte} from "../";

export function parse(source: string, options?: Mustatte.Options): string {
    const tagStack = [] as string[];
    let tagLast: string;
    let comma = "";

    const TAG_MAP = {
        "&": ampersandTag,
        "/": closeTag,
        "!": commentTag,
        "^": invertedSectionTag,
        ">": partialTag,
        "#": sectionTag,
        "{": trippeMustacheTag
    } as { [tag: string]: (str: string) => void };

    const PREFIX = "G([";
    const SUFFIX = "])";
    const COMMA = ",";
    let regexp = "{{([^{}]*|{[^{}]*})}}";

    const buffer = [PREFIX];

    source += "";

    let tag = options?.tag;

    if (!tag) {
        source.replace(/{{=(.*?)=}}/, (match: string, t: string, pos: number): string => {
            let left = source.substr(0, pos);
            source = source.substr(pos + match.length);

            if (left.search(/(^|\n)[ \t]*$/) > -1 &&
                source.search(/^[ \t]*(\r?\n|$)/) > -1) {
                left = left.replace(/[ \t]*$/, "");
                source = source.replace(/^[ \t]*\r?\n?/, "");
            }

            if (left) buffer.push(parse(left, options), COMMA);

            tag = trim(t);

            return "";
        });
    }

    if (tag) {
        tag = tag.replace(/[!-.?\[-\]{-}]/g, escapeChar);
        regexp = tag.replace(/\s+/, "(.*?)");
    }

    const STANDALONE = {"/": 1, "!": 1, "^": 1, ">": 1, "#": 1} as { [chr: string]: number };
    const array = source.split(new RegExp(regexp));
    const last = array.length;

    for (let i = last - 2; i > 0; i -= 2) {
        const left = array[i - 1];
        const right = array[i + 1];

        const standalone = STANDALONE[array[i][0]] &&
            (i === 1 ? left.search(/(^|\n)[ \t]*$/) > -1 : left.search(/\n[ \t]*$/) > -1) &&
            (i === last - 2 ? right.search(/^[ \t]*(\r?\n|$)/) > -1 : right.search(/^[ \t]*\r?\n/) > -1);

        if (standalone) {
            array[i - 1] = left.replace(/[ \t]*$/, "");
            array[i + 1] = right.replace(/^[ \t]*\r?\n?/, "");
        }
    }

    array.forEach(function (str, col) {
        if (col & 1) {
            addTag(str);
        } else {
            addString(str);
        }
    });

    if (tagStack.length) {
        throw new Error("missing closing tag: " + tagLast);
    }

    push(SUFFIX);
    return buffer.join("");

    function push(a: string, b?: string, next?: string) {
        buffer.push(a, b);
        comma = next;
    }

    function addString(str: string): void {
        push(comma, quoteText(str), COMMA);
    }

    function addTag(str: string): void {
        const f = TAG_MAP[str[0]];
        if (f) {
            f(trim(str.substr(1)));
        } else {
            addVariable(trim(str));
        }
    }

    // Variable Unescaped

    function trippeMustacheTag(str: string): void {
        return ampersandTag(str.substr(0, str.length - 1));
    }

    function ampersandTag(str: string): void {
        push(comma, 'U("' + trim(str) + '")', COMMA);
    }

    // Partial tag

    function partialTag(str: string): void {
        push(comma, 'U(">' + trim(str) + '")', COMMA);
    }

    // Section

    function sectionTag(str: string): void {
        tagLast = str;
        tagStack.push(tagLast);
        push(comma, 'S("' + tagLast + '",[');
    }

    // Inverted Section

    function invertedSectionTag(str: string): void {
        tagLast = str;
        tagStack.push(tagLast);
        push(comma, 'I("' + tagLast + '",[');
    }

    // Closing tag

    function closeTag(str: string): void {
        if (!tagStack.length) {
            throw new Error("Closing tag without opener: " + str);
        }
        if (tagLast !== str) {
            throw new Error("Nesting error: " + tagLast + " vs. " + str);
        }
        tagStack.pop();
        tagLast = tagStack[tagStack.length - 1];
        push("", '])', COMMA);
    }

    // Variable Escaped

    function addVariable(str: string): void {
        push(comma, 'V("' + str + '")', COMMA);
    }

    // Comment

    function commentTag(): void {
        // ignore
    }
}

/**
 * @private
 */

const QUOTE_MAP = {
    "\t": "\\t", // 0x09
    "\n": "\\n", // 0x0a
    "\r": "\\r", // 0x0d
    "'": "\\'", // 0x22
    "\\": "\\\\" // 0x5c
} as { [chr: string]: string };

function escapeChar(chr: string) {
    const code = chr.charCodeAt(0);
    return QUOTE_MAP[chr] || ((code < 16 ? "\\x0" : "\\x") + code.toString(16).toUpperCase());
}

function quoteText(str: string) {
    if (str) return "'" + str.replace(/([\x00-\x1F'\\])/g, escapeChar) + "'";
}

function trim(str: string) {
    return str.replace(/^\s+/, "").replace(/\s+$/, "");
}