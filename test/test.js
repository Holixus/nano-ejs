var Ejs = require('../index.js'),
    json = require('nano-json'),
    timer = require('nano-timer'),
    assert = require('core-assert');

function massive(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+json.js2str(args, sradix)+') -> '+json.js2str(ret, dradix)+'', function (done) {
					assert.strictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i], pairs[i+1]);
	});
}

function massive_reversed(name, fn, pairs, sradix, dradix) {
	suite(name, function () {
		for (var i = 0, n = pairs.length; i < n; i += 2)
			(function (args, ret) {
				test(fn.name+'('+json.js2str(args, sradix)+') -> '+json.js2str(ret, dradix)+'', function (done) {
					assert.strictEqual(args instanceof Array ? fn.apply(null, args) : fn.call(null, args), ret);
					done();
				});
			})(pairs[i+1], pairs[i]);
	});
}

suite('new Ejs() // default options', function () {

	massive('parsing with <?=expression?>', function (text) {
		return new Ejs().push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwrwerwer';\n",
		"wrwr<?='5'?>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+('5')+'werwer';\n",
		"wrwr<?=888?>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+(888)+'werwer';\n",
		"<?=888?>werwer", "\"use strict\";\nvar $ = \"\";\n$+=(888)+'werwer';\n",
		"qweqwe<?=888?>", "\"use strict\";\nvar $ = \"\";\n$+='qweqwe'+(888);\n",
		"<?=888?>", "\"use strict\";\nvar $ = \"\";\n$+=(888);\n"
	]);

	massive('parsing with <?.id()?>', function (text) {
		return new Ejs().push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwrwerwer';\n",
		"wrwr<?.fn()?>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+(global.fn())+'werwer';\n",
		"wrwr<?.ooo('4')?>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+(global.ooo('4'))+'werwer';\n",
		"<?.ogo(4)?>werwer", "\"use strict\";\nvar $ = \"\";\n$+=(global.ogo(4))+'werwer';\n",
		"qweqwe<?.job(true)?>", "\"use strict\";\nvar $ = \"\";\n$+='qweqwe'+(global.job(true));\n",
		"<?.just(1.1)?>", "\"use strict\";\nvar $ = \"\";\n$+=(global.just(1.1));\n"
	]);

	massive('parsing with <? JS-CODE ?>', function (text) {
		return new Ejs().push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwrwerwer';\n",
		"wr'wr\n<? /* JS */ ?>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wr\\'wr\\n\\\n';\n/* JS */\n$+='werwer';\n",
		"wrwr<? while (1) {\n\t?>werwer<?\n}?>", "\"use strict\";\nvar $ = \"\";\n$+='wrwr';\nwhile (1) {\n$+='werwer';\n}\n",
		"<? if (o) ?>werwer", "\"use strict\";\nvar $ = \"\";\nif (o)\n$+='werwer';\n",
		"qweqwe<? var q = 1; ?>", "\"use strict\";\nvar $ = \"\";\n$+='qweqwe';\nvar q = 1;\n",
		"<? /* only JS code */ \"use strict\"; ?>", "\"use strict\";\nvar $ = \"\";\n/* only JS code */ \"use strict\";\n"
	]);

	massive('parsing JS ?>test<?', function (text) {
		return new Ejs().push_js(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\nwrwrwerwer\n",
		"wrwrwerwer ?>just test<? js-code", "\"use strict\";\nvar $ = \"\";\nwrwrwerwer\n$+='just test';\njs-code\n",
		"wrwrwerwer ?>just test", "\"use strict\";\nvar $ = \"\";\nwrwrwerwer\n$+='just test';\n"
	]);

	massive('is_ejs() method', function (text) {
		return new Ejs().is_ejs(text);
	}, [
		"rwerwerwer", false,
		"<?ere", true,
		"ererer<?werwer", true,
		"werwerw<?erwerwe?>werwerwer", true,
		"werwer?>werwerwer", false,
		"<?erwerwer?>", true
	]);

	massive('compile and execute with <?=expression?>', function (text) {
		return new Ejs().push_ejs(text).compile('one,two')("-one-", "-two-");
	}, [
		"wrwrwerwer", "wrwrwerwer",
		"wrwr<?='5'?>werwer", "wrwr5werwer",
		"wrwr<?=888?>werwer", "wrwr888werwer",
		"<?=888?>werwer", "888werwer",
		"qweqwe<?=888?>", "qweqwe888",
		"<?=888?>", "888"
	]);

	massive('compile and execute with <?.id()?>', function (text) {
		return new Ejs().push_ejs(text).compile('one,two')("-one-", "-two-");
	}, [
		"wrwr<?.parseInt('45')?>werwer", "wrwr45werwer",
		"<?.parseInt('4')?>werwer", "4werwer",
		"qweqwe<?.parseFloat('5.5')?>", "qweqwe5.5",
		"<?.parseInt('23423')?>", "23423"
	]);

	massive('compile and execute with <? JS-CODE ?>', function (text) {
		return new Ejs().push_ejs(text).compile('one,two')("-one-", "-two-");
	}, [
		"wr'wr\n<? /* JS */ ?>werwer", "wr'wr\nwerwer",
		"wrwr-<? for (var c = 4; c; --c) {\n\t?>(<?=c?> werwer)<?\n}?>", "wrwr-(4 werwer)(3 werwer)(2 werwer)(1 werwer)"
	]);

	massive('Ejs.compile(text, args, opts)', function (text) {
		return Ejs.compile(text, "one,two")("-one-", "-two-");
	}, [
		"wrwrwerwer", "wrwrwerwer",
		"wrwr<?='5'?>werwer", "wrwr5werwer",
		"wrwr<?=888?>werwer", "wrwr888werwer",
		"<?=one?>werwer", "-one-werwer",
		"qweqwe<?=two?>", "qweqwe-two-",
		"<?=888?>", "888",
		"wrwr<?.parseInt('45')?>werwer", "wrwr45werwer",
		"<?.parseInt('4')?>werwer", "4werwer",
		"qweqwe<?.parseFloat('5.5')?>", "qweqwe5.5",
		"<?.parseInt('23423')?>", "23423",
		"wr'wr\n<? /* JS */ ?>werwer", "wr'wr\nwerwer",
		"wrwr-<? for (var c = 4; c; --c) {\n\t?>(<?=c?> werwer)<?\n}?>", "wrwr-(4 werwer)(3 werwer)(2 werwer)(1 werwer)"
	]);

});

suite('new Ejs({ open_str: "<%", close_str: "%>", global_id: "window" })', function () {

	var o = { open_str: "<%", close_str: "%>", global_id: "window" };

	global.window = global;

	massive('parsing with <%=expression%>', function (text) {
		return new Ejs(o).push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwrwerwer';\n",
		"wrwr<%='5'%>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+('5')+'werwer';\n",
		"wrwr<%=888%>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+(888)+'werwer';\n",
		"<%=888%>werwer", "\"use strict\";\nvar $ = \"\";\n$+=(888)+'werwer';\n",
		"qweqwe<%=888%>", "\"use strict\";\nvar $ = \"\";\n$+='qweqwe'+(888);\n",
		"<%=888%>", "\"use strict\";\nvar $ = \"\";\n$+=(888);\n"
	]);

	massive('parsing with <%.id()%>', function (text) {
		return new Ejs(o).push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwrwerwer';\n",
		"wrwr<%.fn()%>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+(window.fn())+'werwer';\n",
		"wrwr<%.ooo('4')%>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwr'+(window.ooo('4'))+'werwer';\n",
		"<%.ogo(4)%>werwer", "\"use strict\";\nvar $ = \"\";\n$+=(window.ogo(4))+'werwer';\n",
		"qweqwe<%.job(true)%>", "\"use strict\";\nvar $ = \"\";\n$+='qweqwe'+(window.job(true));\n",
		"<%.just(1.1)%>", "\"use strict\";\nvar $ = \"\";\n$+=(window.just(1.1));\n"
	]);

	massive('parsing with <% JS-CODE %>', function (text) {
		return new Ejs(o).push_ejs(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\n$+='wrwrwerwer';\n",
		"wr'wr\n<% /* JS */ %>werwer", "\"use strict\";\nvar $ = \"\";\n$+='wr\\'wr\\n\\\n';\n/* JS */\n$+='werwer';\n",
		"wrwr<% while (1) {\n\t%>werwer<%\n}%>", "\"use strict\";\nvar $ = \"\";\n$+='wrwr';\nwhile (1) {\n$+='werwer';\n}\n",
		"<% if (o) %>werwer", "\"use strict\";\nvar $ = \"\";\nif (o)\n$+='werwer';\n",
		"qweqwe<% var q = 1; %>", "\"use strict\";\nvar $ = \"\";\n$+='qweqwe';\nvar q = 1;\n",
		"<% /* only JS code */ \"use strict\"; %>", "\"use strict\";\nvar $ = \"\";\n/* only JS code */ \"use strict\";\n"
	]);

	massive('parsing JS %>test<%', function (text) {
		return new Ejs(o).push_js(text).push_code().listing();
	}, [
		"wrwrwerwer", "\"use strict\";\nvar $ = \"\";\nwrwrwerwer\n",
		"wrwrwerwer %>just test<% js-code", "\"use strict\";\nvar $ = \"\";\nwrwrwerwer\n$+='just test';\njs-code\n",
		"wrwrwerwer %>just test", "\"use strict\";\nvar $ = \"\";\nwrwrwerwer\n$+='just test';\n"
	]);

	massive('is_ejs() method', function (text) {
		return new Ejs(o).is_ejs(text);
	}, [
		"rwerwerwer", false,
		"<%ere", true,
		"ererer<%werwer", true,
		"werwerw<%erwerwe%>werwerwer", true,
		"werwer%>werwerwer", false,
		"<%erwerwer%>", true
	]);

	massive('compile and execute with <%=expression%>', function (text) {
		return new Ejs(o).push_ejs(text).compile('one,two')("-one-", "-two-");
	}, [
		"wrwrwerwer", "wrwrwerwer",
		"wrwr<%='5'%>werwer", "wrwr5werwer",
		"wrwr<%=888%>werwer", "wrwr888werwer",
		"<%=888%>werwer", "888werwer",
		"qweqwe<%=888%>", "qweqwe888",
		"<%=888%>", "888"
	]);

	massive('compile and execute with <%.id()%>', function (text) {
		return new Ejs(o).push_ejs(text).compile('one,two')("-one-", "-two-");
	}, [
		"wrwr<%.parseInt('45')%>werwer", "wrwr45werwer",
		"<%.parseInt('4')%>werwer", "4werwer",
		"qweqwe<%.parseFloat('5.5')%>", "qweqwe5.5",
		"<%.parseInt('23423')%>", "23423"
	]);

	massive('compile and execute with <% JS-CODE %>', function (text) {
		return new Ejs(o).push_ejs(text).compile()();
	}, [
		"wr'wr\n<% /* JS */ %>werwer", "wr'wr\nwerwer",
		"wrwr-<% for (var c = 4; c; --c) {\n\t%>(<%=c%> werwer)<%\n}%>", "wrwr-(4 werwer)(3 werwer)(2 werwer)(1 werwer)"
	]);

	massive('Ejs.compile(text, args, opts)', function (text) {
		return Ejs.compile(text, "one,two", o)("-one-", "-two-");
	}, [
		"wrwrwerwer", "wrwrwerwer",
		"wrwr<%='5'%>werwer", "wrwr5werwer",
		"wrwr<%=888%>werwer", "wrwr888werwer",
		"<%=one%>werwer", "-one-werwer",
		"qweqwe<%=two%>", "qweqwe-two-",
		"<%=888%>", "888",
		"wrwr<%.parseInt('45')%>werwer", "wrwr45werwer",
		"<%.parseInt('4')%>werwer", "4werwer",
		"qweqwe<%.parseFloat('5.5')%>", "qweqwe5.5",
		"<%.parseInt('23423')%>", "23423",
		"wr'wr\n<% /* JS */ %>werwer", "wr'wr\nwerwer",
		"wrwr-<% for (var c = 4; c; --c) {\n\t%>(<%=c%> werwer)<%\n}%>", "wrwr-(4 werwer)(3 werwer)(2 werwer)(1 werwer)"
	]);

});

suite('new Ejs({ open_str: "<%", close_str: "%>", global_id: "window" })', function () {
	test('1 compile crash test', function (done) {
		var text = "ert <? erert] ?> wrtret",
		    src = "function (one,two) {\n\"use strict\";\nvar $ = \"\";\n$+='ert ';\nerert]\n$+=' wrtret';\n;return $;\n}";
		try {
			Ejs.compile(text, "one,two");
			done(Error('not failed!'));
		} catch (e) {
			assert.strictEqual(e.source, src);
			done();
		}
	});

	test('2 compile crash test', function (done) {
		var text = "ert <? erert] ?> wrtret",
		    src = "function () {\n\"use strict\";\nvar $ = \"\";\n$+='ert ';\nerert]\n$+=' wrtret';\n;return $;\n}";
		try {
			Ejs.compile(text);
			done(Error('not failed!'));
		} catch (e) {
			assert.strictEqual(e.source, src);
			done();
		}
	});
});
