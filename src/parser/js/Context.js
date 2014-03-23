var Class = require('../../util/Class');
var cid = 0;
var Context = Class(function(parent, name) {
  this.cid = cid++;
  this.parent = parent || null; //父上下文，如果是全局则为空
  this.name = name || null; //上下文名称，即函数名，函数表达式为空，全局也为空
  this.thisIs = null; //上下文环境中this的值，函数表达式中可能会赋值
  this.children = []; //函数声明或函数表达式所产生的上下文
  this.childrenMap = {}; //键是函数名，值是上下文，匿名函数表达式键为cid
  this.variables = []; //变量var声明
  this.variablesMap = {}; //键为id字面量，值是它的token的节点
  this.params = []; //形参，函数上下文才有，即全局无
  this.paramsMap = {}; //键为id字面量，值是它的token的节点
  this.aParams = []; //实参，函数表达式才有
  this.aParamsMap = {}; //键为id字面量，值是它的token的节点
  this.vids = []; //上下文环境里用到的变量id
  this.vidsMap = {}; //键为id字面量，值是它的token的节点
  this.returns = []; //上下文环境里return语句
  if(!this.isTop()) {
    this.parent.addChild(this);
  }
}).methods({
    getCid: function() {
      return this.cid;
    },
    getName: function() {
      return this.name;
    },
    getParent: function() {
      return this.parent;
    },
    getThis: function() {
      return this.thisIs;
    },
    setThis: function(t) {
      this.thisIs = t;
      return this;
    },
    isTop: function() {
      return !this.parent;
    },
    isFnexpr: function() {
      return !this.isTop() && !this.name;
    },
    hasParam: function(p) {
      return this.paramsMap.hasOwnProperty(p);
    },
    getParams: function() {
      return this.params;
    },
    addParam: function(p) {
      //形参不可能重复，无需判断
      this.paramsMap[p] = this.params.length;
      this.params.push(p);
      return this;
    },
    getAParams: function() {
      return this.aParams;
    },
    addAParam: function(ap) {
      //只记录单字面量参数和this，其它传入null占位
      if(ap !== null) {
        this.aParamsMap[ap] = this.aParams.length;
      }
      this.aParams.push(ap);
      return this;
    },
    getChildren: function() {
      return this.children;
    },
    //仅支持有name的函数声明，表达式无法查找
    hasChild: function(name) {
      return this.childrenMap.hasOwnProperty(name);
    },
    addChild: function(child) {
      var name = child.getName();
      //函数表达式名字为空无法删除
      if(name) {
        this.delChild(name);
      }
      name = name || this.getCid();
      this.childrenMap[name] = child;
      this.children.push(child);
      return this;
    },
    //仅支持有name的函数声明，表达式无法删除
    delChild: function(name) {
      if(this.hasChild(name)) {
        var i = this.children.indexOf(this.childrenMap[name]);
        this.children.splice(i, 1);
        delete this.childrenMap[name];
      }
      return this;
    },
    hasVar: function(v) {
      return this.variablesMap.hasOwnProperty(v);
    },
    addVar: function(node, assign) {
      var v = node.token().content();
      //赋值拥有最高优先级，会覆盖掉之前的函数声明和var
      if(assign) {
        this.delVar(v);
        this.delChild(v);
      }
      //仅仅是var声明无赋值，且已有过声明或函数，忽略之
      else if(this.hasVar(v) || this.hasChild(v)) {
        return this;
      }
      this.variablesMap[v] = true;
      this.variables.push(node);
      return this;
    },
    delVar: function(v) {
      if(this.hasVar(v)) {
        var i = this.variables.indexOf(this.variablesMap[v]);
        this.variables.splice(i, 1);
        delete this.variablesMap[v];
      }
      return this;
    },
    getVars: function() {
      return this.variables;
    },
    addReturn: function(node) {
      this.returns.push(node);
      return this;
    },
    getReturns: function() {
      return this.returns;
    },
    hasVid: function(v) {
      return this.vidsMap.hasOwnProperty(v);
    },
    addVid: function(node) {
      var v = node.token().content();
      if(this.vidsMap.hasOwnProperty(v)) {
        return;
      }
      this.vids.push(node);
      this.vidsMap[v] = node;
      return this;
    },
    getVids: function() {
      return this.vids;
    }
  });
module.exports = Context;