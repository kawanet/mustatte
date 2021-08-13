# Mustatte

[![Node.js CI](https://github.com/kawanet/mustatte/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/kawanet/mustatte/actions/)
[![npm version](https://img.shields.io/npm/v/mustatte)](https://www.npmjs.com/package/mustatte)
[![minified size](https://img.shields.io/bundlephobia/min/mustatte)](https://cdn.jsdelivr.net/npm/mustatte/dist/mustatte.min.js)

Embeddable `{{Mustache}}`-like Tiny Templating Engine

- Templates: `{{#section}}` `{{> partial}}` `{{lambda}}` `{{/section}}`
- Compiler: Precompile `.html` to `.js` for Node.js and Web browsers ready.
- Embeddable: Tiny 1.2KB runtime. No dependent modules required for rendering.
- Reliability: Three years performances in production since 2018.

## SYNOPSIS

```js
const {compile} = require("mustatte");

const template = "hello, {{name}}!";

const render = compile(template);

const context = {name: "Ryu"};

console.log(render(context)); // => "Hello, Ryu!"
```

## COMPILER CLI

`mustatte` CLI tool generates a `.js` file which implements render functions. 

```sh
mustatte --help

mustatte --variable=exports --runtime --output=templates.js *.html
```

HTML Template: `names.html`

```html
<ul>
  {{#list}}
  <li>{{name}}</li>
  {{/list}}
</ul>
```

Node.js:

```js
const templates = require("./templates");

const context = {list: [{name: "Ryu"}, {name: "Ken"}]};

console.log(templates.names(context));
```

Browser:

```html
<script src="./templates.js"></script>
<script>
    const context = {list: [{name: "Ryu"}, {name: "Ken"}]};
    document.body.innerHTML = exports.sample1(context);
</script>
```

Result:

```html
<ul>
  <li>Ryu</li>
  <li>Ken</li>
</ul>
```

## TEMPALTING SYNTAX

The compiled render function accepts a pair of arguments: the main (current) context and the alt (fallback) context.

```
const {compile} = require("mustatte");

const template = "{{foo}}-{{.foo}}-{{>foo}} {{bar}}-{{.bar}}-{{>bar}}";

const context = { foo: "[FOO]" };
const alt = { foo: "[foo]", bar: "[bar]" };

const render = compile(template);

console.log(render(context, alt)); // => "[FOO]-[FOO]-[foo] [bar]--[bar]"
```

### Interpolation

| Prefix | Behavior | Example | Main context | Alt context | HTML escape |
| --- | --- | --- | --- | --- | --- |
| (none) | Normal | `{{ foo.bar }}` | Yes (primary) | Yes (secondary) | Escaped |
| `&` | Unescaped | `{{& foo.bar }}` | Yes (primary) | Yes (secondary) | Raw |
| `.` | Main only | `{{. foo.bar }}` | Yes | N/A | Escaped |
| `>` | Alt only | `{{> foo.bar }}` | N/A | Yes | Raw |

### Sections

```
{{# section }} show this when true {{/ section }}

{{^ inverted }} show this when false {{/ inverted }}
```

### Comments

`!` indicates comments which are just ignored.

```
{{! comment }}
```

### Triple Mustache

`&` renders a raw HTML string without escaped.

```
{{{ foo.bar }}}

{{& foo.bar }} // same
```

### Patial

`>` refers the alt context which would execute Lambdas in safe.

```
{{> partial }}
```

### Altering Delimiter

`=` makes the templating tag changed.

```
{{= <% %> =}}

<%# section %> <% foo.bar %> <%/ section %>
```

## COMPATIBILITY

It passes 88% of the original [Mustache spec](https://github.com/mustache/spec) test suite.
The rest of the tests are skipped in due to changes made for security or performance reasons.
The following minor features are not supported by the module.

- A lambda's return value should be parsed.
- All elements on the context stack should be accessible.
- Each line of the partial should be indented before rendering.
- Lambdas used for inverted sections should be considered truthy.
- Lambdas used for sections should receive the raw section string.

## BROWSERS

Less than 4KB minified build is available for Web browsers.

- https://cdn.jsdelivr.net/npm/mustatte/dist/mustatte.min.js

```html
<script src="https://cdn.jsdelivr.net/npm/mustatte/dist/mustatte.min.js"></script>
<script>
  const {compile} = Mustatte;
  const template = "hello, {{name}}!";
  const render = compile(template);
  const context = {name: "Ryu"};
  document.body.innerHTML = render(context);
</script>
```

### LINKS

- https://github.com/kawanet/mustatte
- https://github.com/kawanet/promistache
- https://www.npmjs.com/package/handlebars
- https://www.npmjs.com/package/hogan.js
- https://www.npmjs.com/package/mustatte

### LICENSE

MIT License

Copyright (c) 2018-2021 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
