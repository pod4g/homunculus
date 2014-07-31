var homunculus = require('../');

var expect = require('expect.js');
var path = require('path');

var Token = homunculus.getClass('token');
var HtmlLexer = homunculus.getClass('lexer', 'html');

function join(tokens) {
  var arr = tokens.map(function(token) {
    return token.content();
  });
  return arr;
}
function type(tokens, tag) {
  var arr = tokens.map(function(token) {
    return tag ? Token.type(token.type()) : token.type();
  });
  return arr;
}

describe('htmllexer', function() {
  describe('simple test', function() {
    describe('commnet', function() {
      it('normal', function () {
        var lexer = homunculus.getLexer('html');
        var tokens = lexer.parse('<!--comment-->');
        expect(join(tokens)).to.eql(['<!--comment-->']);
        expect(type(tokens)).to.eql([6]);
      });
    });
    describe('doctype', function() {
      it('normal', function () {
        var lexer = homunculus.getLexer('html');
        var tokens = lexer.parse('<!DOCTYPE>');
        expect(join(tokens)).to.eql(['<', '!DOCTYPE', '>']);
        expect(type(tokens)).to.eql([26, 12, 26]);
      });
      it('ignore case', function () {
        var lexer = homunculus.getLexer('html');
        var tokens = lexer.parse('<!doctype>');
        expect(join(tokens)).to.eql(['<', '!doctype', '>']);
        expect(type(tokens)).to.eql([26, 12, 26]);
      });
    });
    describe('markdown', function() {
      it('normal', function () {
        var lexer = homunculus.getLexer('html');
        var tokens = lexer.parse('<html></html>');
        expect(join(tokens)).to.eql(['<', 'html', '>', '</', 'html', '>']);
        expect(type(tokens)).to.eql([26, 10, 26, 26, 10, 26]);
      });
      it('selfclose', function() {
        var lexer = homunculus.getLexer('html');
        var tokens = lexer.parse('<img/>');
        expect(join(tokens)).to.eql(['<', 'img', '/>']);
        expect(type(tokens)).to.eql([26, 10, 26]);
      });
      it('without />', function() {
        var lexer = homunculus.getLexer('html');
        var tokens = lexer.parse('<img>');
        expect(join(tokens)).to.eql(['<', 'img', '>']);
        expect(type(tokens)).to.eql([26, 10, 26]);
      });
      it('attribute', function() {
        var lexer = homunculus.getLexer('html');
        var tokens = lexer.parse('<a href="#">');
        expect(join(tokens)).to.eql(['<', 'a', ' ', 'href', '=', '"#"', '>']);
        expect(type(tokens)).to.eql([26, 10, 1, 15, 8, 7, 26]);
      })
    });
  });
});