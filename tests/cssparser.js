var homunculus = require('../');

var expect = require('expect.js');
var fs = require('fs');
var path = require('path');

var Token = homunculus.getClass('token');
var Parser = homunculus.getClass('parser', 'css');
var CssNode = homunculus.getClass('node', 'css');

var res;
var index;

function jion(node, ignore) {
  res = '';
  index = 0;
  while(ignore[index]) {
    res += ignore[index++].content();
  }
  recursion(node, ignore);
  return res;
}
function recursion(node, ignore) {
  var isToken = node.name() == CssNode.TOKEN;
  var isVirtual = isToken && node.token().type() == Token.VIRTUAL;
  if(isToken) {
    if(!isVirtual) {
      var token = node.token();
      res += token.content();
      while(ignore[++index]) {
        res += ignore[index].content();
      }
    }
  }
  else {
    node.leaves().forEach(function(leaf, i) {
      recursion(leaf, ignore);
    });
  }
}

function tree(node, arr) {
  arr = arr || [];
  var isToken = node.name() == CssNode.TOKEN;
  var isVirtual = isToken && node.token().type() == Token.VIRTUAL;
  if(isToken) {
    if(!isVirtual) {
      var token = node.token();
      arr.push(token.content());
    }
  }
  else {
    arr.push(node.name());
    var childs = [];
    arr.push(childs);
    node.leaves().forEach(function(leaf, i) {
      tree(leaf, childs);
    });
  }
  return arr;
}

describe('cssparser', function() {
  describe('simple test', function() {
    it('@import string', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@import "a";');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.IMPORT,["@import",CssNode.URL,["\"a\""],";"]]]);
    });
    it('@import ignore case', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@IMPORT "a";');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.IMPORT,["@IMPORT",CssNode.URL,["\"a\""],";"]]]);
    });
    it('@import url(string)', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@import url("a");');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.IMPORT,["@import",CssNode.URL,["url","(","\"a\"",")"],";"]]]);
    });
    it('@import url(string) no quote', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@import url(a);');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.IMPORT,["@import",CssNode.URL,["url","(","a",")"],";"]]]);
    });
    it('@import error', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@import');
      }).to.throwError();
    });
    it('@import string no ; error', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@import url(a)');
      }).to.throwError();
    });
    it('@import string with \' error', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@import \'a\';');
      }).to.throwError();
    });
    it('@media query type', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@media all');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.MEDIA,["@media",CssNode.MEDIAQLIST,[CssNode.MEDIAQUERY,[CssNode.MEDIATYPE,["all"]]]]]]);
    });
    it('@media query expr', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@media (width:100)');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.MEDIA,["@media",CssNode.MEDIAQLIST,[CssNode.MEDIAQUERY,[CssNode.EXPR,["(",CssNode.KEY,["width"],":",CssNode.VALUE,["100"],")"]]]]]]);
    });
    it('@media query{}', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@media all{}');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.MEDIA,["@media",CssNode.MEDIAQLIST,[CssNode.MEDIAQUERY,[CssNode.MEDIATYPE,["all"]]],CssNode.BLOCK,["{","}"]]]]);
    });
    it('@media query and', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@media not all and(width:800px)');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.MEDIA,["@media",CssNode.MEDIAQLIST,[CssNode.MEDIAQUERY,["not",CssNode.MEDIATYPE,["all"],"and",CssNode.EXPR,["(",CssNode.KEY,["width"],":",CssNode.VALUE,["800","px"],")"]]]]]]);
    });
    it('@media multi query', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@media only screen and (-webkit-min-device-pixel-ratio: 2), screen and (min--moz-device-pixel-ratio: 2){}');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.MEDIA,["@media",CssNode.MEDIAQLIST,[CssNode.MEDIAQUERY,["only",CssNode.MEDIATYPE,["screen"],"and",CssNode.EXPR,["(",CssNode.KEY,["-webkit-","min-device-pixel-ratio"],":",CssNode.VALUE,["2"],")"]],",",CssNode.MEDIAQUERY,[CssNode.MEDIATYPE,["screen"],"and",CssNode.EXPR,["(",CssNode.KEY,["min--moz-device-pixel-ratio"],":",CssNode.VALUE,["2"],")"]]],CssNode.BLOCK,["{","}"]]]]);
    });
    it('@media hack 1', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@media screen\\9');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.MEDIA,["@media",CssNode.MEDIAQLIST,[CssNode.MEDIAQUERY,[CssNode.MEDIATYPE,["screen","\\9"]]]]]]);
    });
    it('@media hack 2', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@media \\0screen\\,screen\\9');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.MEDIA,["@media",CssNode.MEDIAQLIST,[CssNode.MEDIAQUERY,[CssNode.MEDIATYPE,["\\0","screen","\\,","screen","\\9"]]]]]]);
    });
    it('@media error 1', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@media');
      }).to.throwError();
    });
    it('@media error 2', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@media(');
      }).to.throwError();
    });
    it('@media error 3', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@media (notkeyword:1)');
      }).to.throwError();
    });
    it('@charset string', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@charset "arail";');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.CHARSET,["@charset","\"arail\"",";"]]]);
    });
    it('@charset error 1', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@charset');
      }).to.throwError();
    });
    it('@charset error 2', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@charset "arial"');
      }).to.throwError();
    });
    it('@font-face normal', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@font-face{font-family:YH;src:url(http://domain/fonts/MSYH.TTF)}');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.FONTFACE,["@font-face",CssNode.BLOCK,["{",CssNode.STYLE,[CssNode.KEY,["font-family"],":",CssNode.VALUE,["YH"],";"],CssNode.STYLE,[CssNode.KEY,["src"],":",CssNode.VALUE,["url","(","http://domain/fonts/MSYH.TTF",")"]],"}"]]]]);
    });
    it('@font-face with format', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@font-face{font-family:YH;src:url(xx),format("embedded-opentype")}');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.FONTFACE,["@font-face",CssNode.BLOCK,["{",CssNode.STYLE,[CssNode.KEY,["font-family"],":",CssNode.VALUE,["YH"],";"],CssNode.STYLE,[CssNode.KEY,["src"],":",CssNode.VALUE,["url","(","xx",")",",","format","(","\"embedded-opentype\"",")"]],"}"]]]]);
    });
    it('@font-face mulit', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@font-face{font-family:YH;src:url(a),url(b)}');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.FONTFACE,["@font-face",CssNode.BLOCK,["{",CssNode.STYLE,[CssNode.KEY,["font-family"],":",CssNode.VALUE,["YH"],";"],CssNode.STYLE,[CssNode.KEY,["src"],":",CssNode.VALUE,["url","(","a",")",",","url","(","b",")"]],"}"]]]]);
    });
    it('@charset error 1', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@font-face');
      }).to.throwError();
    });
    it('@charset error 2', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@font-face{}');
      }).to.throwError();
    });
    it('@charset error 3', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@font-face{src:url(a)}');
      }).to.throwError();
    });
    it('@page normal', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@page thin:first{size:3in 8in}');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.PAGE,["@page","thin",":first",CssNode.BLOCK,["{",CssNode.STYLE,[CssNode.KEY,["size"],":",CssNode.VALUE,["3","in","8","in"]],"}"]]]]);
    });
    it('@page without id', function() {
      var parser = homunculus.getParser('css');
      var node = parser.parse('@page :first{size:3in 8in}');
      expect(tree(node)).to.eql([CssNode.SHEET,[CssNode.PAGE,["@page",":first",CssNode.BLOCK,["{",CssNode.STYLE,[CssNode.KEY,["size"],":",CssNode.VALUE,["3","in","8","in"]],"}"]]]]);
    });
    it('@page error 1', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@page thin:first');
      }).to.throwError();
    });
    it('@page error 2', function() {
      var parser = homunculus.getParser('css');
      expect(function() {
        parser.parse('@page {}');
      }).to.throwError();
    });
  });
});