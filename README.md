# nano-ejs

A very small, simple and fast EJS compiler.


[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

## Usage

```js
> var Ejs = require('nano-ejs');
> console.log(Ejs.compile('test <?=one?>', 'one')('ola'));
test ola
> _
```

## EJS syntax

### JS expressions embedding ```<?=JS_EXPRESSION?>```

```html
<!DOCTYPE>
<html><head><title><?=PAGE_TITLE?></title></head><body></body></html>
```

### JS statements embedding ```<? JS_STATEMENTS ?>```

```html
<!DOCTYPE>
<html><head><title><?=PAGE_TITLE?></title></head><body><?
  if (V1) {
    ?>V1<?
  } else {
    ?>V2<?
  }
?></body></html>
```

### JS global calls embedding <?.function()?>

The same as ```<?=global.function()?>```, where 'global' can be redefined by EJS object option 'global_id'.

That construction useful then you pass some of object to EJS function like...
```js
var Ejs = require('nano-ejs'),
    css_helpers = require('css-helpers'); // hypotetical module

var css_text = '\
.error   { color: <?.hsv2hrgb(0, 1, 1)?>; }\n\
.warning { color: <?.hsv2hrgb(120, 1, 1)?>; }\n\
';

var ejs_fn = Ejs.compile(css_text, 'css_helpers', { global_id: 'css_helpers' });
console.log(ejs_fn(css_helpers));
```
console output:
```
.error   { color: #FF0000; }\n\
.warning { color: #00FF00; }\n\

```

## API

### Ejs.compile(text[, args[, options]])

* text `String` EJS text
* args `String` compiled function arguments list (for ```new Function (args, body)```)
* options `Object`
 * open_str `String` open embedded JS code symbols sequence (the default value is '<?')
 * close_str `String` clode embedded JS code symbols sequence (the default value is '?>')
 * global_id `String` identifier of global object (like `global` or `window`) (the default value is 'global')

### class: Ejs

#### new Ejs(options)

* options `Object`
 * open_str `String` open embedded JS code symbols sequence (the default value is '<?')
 * close_str `String` clode embedded JS code symbols sequence (the default value is '?>')
 * global_id `String` identifier of global object (like `global` or `window`) (the default value is 'global')

EJS parser context.

#### .is_ejs(text)

return `Boolean`

Check the text for EJS injections. Returns ```true``` for EJS texts.

#### .push_ejs(text)

* text `String` EJS text

Parse EJS text and append to the final JS code.

#### .push_js(text)

* text `String` JS text

Parse JS with texts injections (?>test<?) and append to the final JS code.

#### .compile(args)

* args `String` compiled function arguments list (for ```new Function (args, body)``)

Returns compiled JS function of EJS source.

#### .listing()

returns JavaScript code translated from EJS.

[gitter-image]: https://badges.gitter.im/Holixus/nano-ejs.png
[gitter-url]: https://gitter.im/Holixus/nano-ejs
[npm-image]: https://img.shields.io/npm/v/nano-ejs.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nano-ejs
[github-tag]: http://img.shields.io/github/tag/Holixus/nano-ejs.svg?style=flat-square
[github-url]: https://github.com/Holixus/nano-ejs/tags
[travis-image]: https://travis-ci.org/Holixus/nano-ejs.svg?branch=master
[travis-url]: https://travis-ci.org/Holixus/nano-ejs
[coveralls-image]: https://img.shields.io/coveralls/Holixus/nano-ejs.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/Holixus/nano-ejs
[david-image]: http://img.shields.io/david/Holixus/nano-ejs.svg?style=flat-square
[david-url]: https://david-dm.org/Holixus/nano-ejs
[license-image]: http://img.shields.io/npm/l/nano-ejs.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/nano-ejs.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/nano-ejs
