(function(factory) {
  if(typeof define === 'function' && (define.amd || define.cmd)) {
    define(factory);
  }
  else {
    factory(require, exports, module);
  }
})(function(require, exports, module) {
  var Class = require('../util/Class');
  var character = require('../util/character');
  var Node = Class(function(type, children) {
    this.type = type;
    if(type == Node.TOKEN) {
      this.children = children;
    }
    else if(Array.isArray(children)) {
      this.children = children;
    }
    else {
      this.children = children ? [children] : [];
    }
    this.p = null;
    this.pr = null;
    this.ne = null;
    return this;
  }).methods({
    name: function(t) {
      if(!character.isUndefined(t)) {
        this.type = t;
      }
      return this.type;
    },
    leaves: function() {
      return this.children;
    },
    leaf: function(i) {
      return this.children[i];
    },
    size: function() {
      return this.children.length;
    },
    first: function() {
      return this.leaf(0);
    },
    last: function() {
      return this.leaf(this.size() - 1);
    },
    isEmpty: function() {
      return this.size() === 0;
    },
    add: function() {
      var self = this;
      var args = Array.prototype.slice.call(arguments, 0);
      args.forEach(function(node) {
        node.parent(self);
        var last = self.children[self.children.length - 1];
        if(last) {
          last.next(node);
          node.prev(last);
        }
        self.children.push(node);
      });
      return self;
    },
    token: function() {
      return this.children;
    },
    parent: function(p) {
      if(p) {
        this.p = p;
      }
      return this.p;
    },
    prev: function(pr) {
      if(pr) {
        this.pr = pr;
      }
      return this.pr;
    },
    next: function(ne) {
      if(ne) {
        this.ne = ne;
      }
      return this.ne;
    }
  }).statics({
    TOKEN: 'token'
  });
  module.exports = Node;
});