"use strict";

/*
	options = {
		open_str:  '<?',
		close_str: '?>',
		global_id: 'global'
	}
*/

function Ejs(options) {
	if (!options)
		options = {};

	var code = [],
	    text_mode = false,

	    open_str = options.open_str || '<?',
	    close_str = options.close_str || '?>',
	    open_str_len = open_str.length,
	    close_str_len = close_str.length,
	    global_id = options.global_id || 'global',

	    push_expr = /*this.push_expr = */function _push_expr() {
			code.push(text_mode ? ", " : "$.push(");
			code.push.apply(code, arguments);
			text_mode = true;
			return this;
		},

	    push_string = /*this.push_string = */function _push_string(str) {
			code.push(
				!text_mode ? "$.push('" : ", '",
				str.replace(/[\\'\n]/g, /*'*/function (match) {
					return match === '\n' ? "\\n\\\n" : '\\'+match;
				}),
				"'");
			text_mode = true;
			return this;
		},

	    push_code = this.push_code = function _push_code() {
			if (text_mode)
				code.push(");\n");
			text_mode = false;
			if (arguments.length)
				code.push.apply(code, arguments);
			return this;
		};

	function parse(tpl, mode) {
		var tpl = tpl,
		    js = mode == 'js';

		for (var pos = 0, js_pos = pos, len = tpl.length; pos < len;) {
			if (!js) {
				var js_pos = tpl.indexOf(open_str, pos);
				if (js_pos != pos)
					push_string(tpl.slice(pos, (js_pos >= 0) ? js_pos : len));

				if (js_pos < 0) {
					pos = len;
					continue;
				}
				js_pos += open_str_len;
			}

			js = 0;
			var js_end = tpl.indexOf(close_str, js_pos);
			if (js_end < 0)
				js_end = len;
			switch (tpl.charAt(js_pos)) {
			case '=':
				push_expr(tpl.slice(js_pos + 1, js_end), "+''");
				break;
			case '.':
				push_expr(global_id, '.', tpl.slice(js_pos + 1, js_end), "+''");
				break;
			default:
				push_code(tpl.slice(js_pos, js_end).trim(), '\n');
			}
			pos = js_end + close_str_len;
		}
	}

	var push_ejs = this.push_ejs = function _push_ejs(tpl) {
			parse(tpl, 'ejs');
			return this;
		},
	    push_js = this.push_js = function _push_js(tpl) {
			parse(tpl, 'js');
			return this;
		},
	    listing = this.listing = function _listing() {
			return code.join('');
		},
	    compile = this.compile = function _compile(args) {
			code.unshift("var $=[];\n");
			push_code("return $.join('');\n");
			var f = new Function(args, listing());
			code = [];
			return f;
		};

	this.is_ejs = function (text) {
		return text.indexOf(open_str) >= 0;
	}
}


Ejs.prototype = {
};

Ejs.compile = function (text, args, opts) {
	return new Ejs(opts).push_ejs(text).compile(args);
};

module.exports = Ejs;
