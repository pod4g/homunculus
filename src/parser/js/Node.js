var Class = require('../../util/Class');
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
  name: function() {
    return this.type;
  },
  leaves: function() {
    return this.children;
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
  PROGRAM: 'program',
  ELEMS: 'elems',
  ELEM: 'elem',
  CSTSTMT: 'cststmt',
  LETSTMT: 'letstmt',
  VARSTMT: 'varstmt',
  VARDECL: 'vardecl',
  FNBODY: 'fnbody',
  BLOCK: 'block',
  ITERSTMT: 'iterstmt',
  TOKEN: 'token',
  FNPARAMS: 'fnparams',
  BINDELEMENT: 'bindelement',
  RESTPARAM: 'restparam',
  EXPR: 'expr',
  CLASSDECL: 'classdecl',
  CLASSTAIL: 'classtail',
  HERITAGE: 'heritage',
  CLASSBODY: 'classbody',
  METHOD: 'method',
  SUPERSTMT: 'superstmt',
  GETFN: 'getfn',
  SETFN: 'setfn',
  PROGRAM: 'program',
  STMT: 'stmt',
  ASSIGN: 'assign',
  EMPTSTMT: 'emptstmt',
  IFSTMT: 'ifstmt',
  CNTNSTMT: 'cntnstmt',
  BRKSTMT: 'brkstmt',
  RETSTMT: 'retstmt',
  WITHSTMT: 'withstmt',
  SWCHSTMT: 'swchstmt',
  CASEBLOCK: 'caseblock',
  CASECLAUSE: 'caseclause',
  DFTCLAUSE: 'dftclause',
  LABSTMT: 'labstmt',
  THRSTMT: 'thrstmt',
  TRYSTMT: 'trystmt',
  DEBSTMT: 'debstmt',
  CACH: 'cach',
  FINL: 'finl',
  FNDECL: 'fndecl',
  FNEXPR: 'fnexpr',
  ASSIGNEXPR: 'assignexpr',
  CNDTEXPR: 'cndtexpr',
  LOGOREXPR: 'logorexpr',
  LOGANDEXPR: 'logandexpr',
  BITOREXPR: 'bitorexpr',
  BITANDEXPR: 'bitandexpr',
  BITXOREXPR: 'bitxorexpr',
  EQEXPR: 'eqexpr',
  RELTEXPR: 'reltexpr',
  SHIFTEXPR: 'shiftexpr',
  ADDEXPR: 'addexpr',
  MTPLEXPR: 'mtplexpr',
  UNARYEXPR: 'unaryexpr',
  CONSTOR: 'constor',
  CONSCALL: 'conscall',
  MMBEXPR: 'mmbexpr',
  PRMREXPR: 'prmrexpr',
  ARRLTR: 'arrltr',
  OBJLTR: 'objltr',
  PROPTASSIGN: 'proptassign',
  PROPTNAME: 'proptname',
  PROPTSETS: 'propsets',
  ARGS: 'args',
  ARGLIST: 'arglist',
  IMPTSTMT: 'imptstmt'
});
module.exports = Node;