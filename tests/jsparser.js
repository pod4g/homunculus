var homunculus = require('../homunculus');

var expect = require('expect.js');
var fs = require('fs');
var path = require('path');

var Token = homunculus.getClass('token');
var JsNode = homunculus.getClass('node', 'js');

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
  var isToken = node.name() == JsNode.TOKEN;
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
  var isToken = node.name() == JsNode.TOKEN;
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

describe('jsparser', function() {
  describe('simple test', function() {
    it('varstmt no assign', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('var a;');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.VARSTMT, ['var', JsNode.VARDECL, ['a'], ';']]]);
    });
    it('varstmt with assign', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('var a = 1;');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.VARSTMT, ['var', JsNode.VARDECL, ['a', JsNode.ASSIGN, ['=', JsNode.PRMREXPR, [1]]], ';']]]);
    });
    it('varstmt with multi', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('var a, b = 1;');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.VARSTMT, ['var', JsNode.VARDECL, ['a'], ',', JsNode.VARDECL, ['b', JsNode.ASSIGN, ['=', JsNode.PRMREXPR, [1]]], ';']]]);
    });
    it('newexpr 1', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('new A');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.NEWEXPR, ['new', JsNode.PRMREXPR, ['A']]]]]);
    });
    it('newexpr 2', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('new A()');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.NEWEXPR, ['new', JsNode.PRMREXPR, ['A'], JsNode.ARGS, ['(', ')']]]]]);
    });
    it('newexpr 3', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('new A().f');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.MMBEXPR, [JsNode.NEWEXPR, ['new', JsNode.PRMREXPR, ['A'], JsNode.ARGS, ['(', ')']], '.', 'f']]]]);
    });
    it('newexpr 4', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('new A().f()');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.CALLEXPR, [JsNode.MMBEXPR, [JsNode.NEWEXPR, ['new', JsNode.PRMREXPR, ['A'], JsNode.ARGS, ['(', ')']], '.', 'f'], JsNode.ARGS, ['(', ')']]]]]);
    });
    it('newexpr 5', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('new new A().f()');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.NEWEXPR, ['new', JsNode.MMBEXPR, [JsNode.NEWEXPR, ['new', JsNode.PRMREXPR, ['A'], JsNode.ARGS, ['(', ')']], '.', 'f'], JsNode.ARGS, ['(', ')']]]]]);
    });
    it('mmbexpr 1', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('a.b.c');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.MMBEXPR, [JsNode.PRMREXPR, ['a'], '.', 'b', '.', 'c']]]]);
    });
    it('mmbexpr 2', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('a.b[c]');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.MMBEXPR, [JsNode.PRMREXPR, ['a'], '.', 'b', '[', JsNode.PRMREXPR, ['c'], ']']]]]);
    });
    it('returnstmt 1', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('return a');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.RETSTMT, ['return', JsNode.PRMREXPR, ['a']]]]);
    });
    it('returnstmt 2', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('return\na');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.RETSTMT, ['return'], JsNode.STMT, [JsNode.PRMREXPR, ['a']]]]);
    });
    it('returnstmt 3', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('return/*\n*/a');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.RETSTMT, ['return'], JsNode.STMT, [JsNode.PRMREXPR, ['a']]]]);
    });
    it('returnstmt 4', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('return a\nreturn');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.RETSTMT, ['return', JsNode.PRMREXPR, ['a']], JsNode.RETSTMT, ['return']]]);
    });
    it('postfixexpr 1', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('a++ + b');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.ADDEXPR, [JsNode.POSTFIXEXPR, [JsNode.PRMREXPR, ['a'], '++'], '+', JsNode.PRMREXPR, ['b']]]]]);
    });
    it('postfixexpr 2', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('a\nb++');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.PRMREXPR, ['a']], JsNode.STMT, [JsNode.POSTFIXEXPR, [JsNode.PRMREXPR, ['b'], '++']]]]);
    });
    it('postfixexpr 3', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('a/*\n*/b++');
      expect(tree(node)).to.eql([JsNode.PROGRAM, [JsNode.STMT, [JsNode.PRMREXPR, ['a']], JsNode.STMT, [JsNode.POSTFIXEXPR, [JsNode.PRMREXPR, ['b'], '++']]]]);
    });
    it('node parent,prev,next', function() {
      var parser = homunculus.getParser('js');
      var node = parser.parse('var a, b;');
      var varstmt = node.leaves()[0];
      var children = varstmt.leaves();
      var a = children[0];
      var b = children[1];
      expect(node.parent()).to.be(null);
      expect(a.parent()).to.be(varstmt);
      expect(b.parent()).to.be(varstmt);
      expect(a.prev()).to.be(null);
      expect(a.next()).to.be(b);
      expect(b.prev()).to.be(a);
    });
  });
  describe('js lib exec test', function() {
    it('jquery 1.11.0', function() {
      var parser = homunculus.getParser('js');
      var code = fs.readFileSync(path.join(__dirname, './lib/jquery-1.11.0.js'), { encoding: 'utf-8' });
      var node = parser.parse(code);
      var ignore = parser.ignore();
      var str = jion(node, ignore);
      expect(str).to.eql(code);
    });
    it('backbone 1.1.0', function() {
      var parser = homunculus.getParser('js');
      var code = fs.readFileSync(path.join(__dirname, './lib/backbone.js'), { encoding: 'utf-8' });
      var node = parser.parse(code);
      var ignore = parser.ignore();
      var str = jion(node, ignore);
      expect(str).to.eql(code);
    });
    it('handlebars', function() {
      var parser = homunculus.getParser('js');
      var code = fs.readFileSync(path.join(__dirname, './lib/handlebars.js'), { encoding: 'utf-8' });
      var node = parser.parse(code);
      var ignore = parser.ignore();
      var str = jion(node, ignore);
      expect(str).to.eql(code);
    });
    it('bootstrap 3.0.0', function() {
      var parser = homunculus.getParser('js');
      var code = fs.readFileSync(path.join(__dirname, './lib/bootstrap.js'), { encoding: 'utf-8' });
      var node = parser.parse(code);
      var ignore = parser.ignore();
      var str = jion(node, ignore);
      expect(str).to.eql(code);
    });
    it('expect 0.1.2', function() {
      var parser = homunculus.getParser('js');
      var code = fs.readFileSync(path.join(__dirname, './lib/expect.js'), { encoding: 'utf-8' });
      var node = parser.parse(code);
      var ignore = parser.ignore();
      var str = jion(node, ignore);
      expect(str).to.eql(code);
    });
    it('html5shiv 3.6.1', function() {
      var parser = homunculus.getParser('js');
      var code = fs.readFileSync(path.join(__dirname, './lib/html5shiv.js'), { encoding: 'utf-8' });
      var node = parser.parse(code);
      var ignore = parser.ignore();
      var str = jion(node, ignore);
      expect(str).to.eql(code);
    });
  });
});