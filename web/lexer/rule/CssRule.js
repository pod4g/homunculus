define(function(require, exports, module) {var Rule = require('./Rule');
var LineSearch = require('../match/LineSearch');
var LineParse = require('../match/LineParse');
var CompleteEqual = require('../match/CompleteEqual');
var CharacterSet = require('../match/CharacterSet');
var RegMatch = require('../match/RegMatch');
var Token = require('../CssToken');
var character = require('../../util/character');
var CssRule = Rule.extend(function() {
  var self = this;
  Rule.call(self, CssRule.KEYWORDS);

  self.vl = {};
  CssRule.VALUES.forEach(function(o) {
    self.vl[o] = true;
  });

  self.cl = {};
  CssRule.COLORS.forEach(function(o) {
    self.cl[o] = true;
  });

  self.addMatch(new CompleteEqual(Token.BLANK, character.BLANK));
  self.addMatch(new CompleteEqual(Token.TAB, character.TAB));
  self.addMatch(new CompleteEqual(Token.LINE, character.ENTER + character.LINE));
  self.addMatch(new CompleteEqual(Token.LINE, character.ENTER));
  self.addMatch(new CompleteEqual(Token.LINE, character.LINE));

  self.addMatch(new LineSearch(Token.COMMENT, '//', [character.ENTER + character.LINE, character.ENTER, character.LINE]));
  self.addMatch(new LineSearch(Token.COMMENT, '/*', '*/', true));
  self.addMatch(new LineParse(Token.STRING, '"', '"', false));
  self.addMatch(new LineParse(Token.STRING, "'", "'", false));

  self.addMatch(new RegMatch(Token.NUMBER, /^[+-]?\d+\.?\d*/i));
  self.addMatch(new RegMatch(Token.NUMBER, /^[+-]?\.\d+/i));
  self.addMatch(new CompleteEqual(Token.UNITS, '%', null, true));

  self.addMatch(new CompleteEqual(Token.HACK, '\\9\\0'));
  self.addMatch(new CompleteEqual(Token.HACK, '\\0/'));
  self.addMatch(new CompleteEqual(Token.HACK, '\\0'));
  self.addMatch(new CompleteEqual(Token.HACK, '\\9'));
  self.addMatch(new CompleteEqual(Token.HACK, '\\,'));
  self.addMatch(new CompleteEqual(Token.HACK, '-vx-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-hp-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-khtml-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, 'mso-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-prince-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-rim-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-ro-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-tc-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-wap-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-apple-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-atsc-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-ah-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-moz-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-webkit-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-ms-'), null, true);
  self.addMatch(new CompleteEqual(Token.HACK, '-o-'), null, true);

  self.addMatch(new RegMatch(Token.COLOR, /^#[\da-f]{3,6}/i));
  self.addMatch(new RegMatch(Token.SELECTOR, /^\.[a-z_][\w_\-]*/i));
  self.addMatch(new RegMatch(Token.SELECTOR, /^#\w[\w\-]*/i));
  self.addMatch(new CompleteEqual(Token.SELECTOR, '&'));
  self.addMatch(new RegMatch(Token.VARS, /^var-[\w\-]+/i));
  self.addMatch(new RegMatch(Token.VARS, /^--[\w\-]+/i));
  self.addMatch(new CompleteEqual(Token.KEYWORD, 'min--moz-device-pixel-ratio'));
  self.addMatch(new CompleteEqual(Token.KEYWORD, 'max--moz-device-pixel-ratio'));
  self.addMatch(new RegMatch(Token.ID, /^[a-z][\w\-]*/i));
  self.addMatch(new RegMatch(Token.STRING, /^(\\[a-z\d]{4})+/i));
  self.addMatch(new CompleteEqual(Token.IMPORTANT, '!important', null, true));
  self.addMatch(new RegMatch(Token.HACK, /^![a-z]+/i));
  self.addMatch(new RegMatch(Token.PSEUDO, /^::?(?:-(?:moz|webkit|ms|o)-)?[a-z]+(?:-[a-z]+)*/i));
  ['$=', '|=', '*=', '~=', '^=', '>=', '<=', '!=', '==', '++', '--'].forEach(function(o) {
    self.addMatch(new CompleteEqual(Token.SIGN, o));
  });

  var head = new RegMatch(Token.HEAD, /^@[\w-]+/);
  head.callback = function(token) {
    var s = token.content().toLowerCase();
    s = s.replace(/^@(-moz-|-o-|-ms-|-webkit-|-vx-|-hp-|-khtml-|mso-|-prince-|-rim-|-ro-|-tc-|-wap-|-apple-|-atsc-|-ah-)/, '@');
    if(!{
      '@page': true,
      '@import': true,
      '@charset': true,
      '@media': true,
      '@font-face': true,
      '@keyframes': true,
      '@namespace': true,
      '@document': true,
      '@counter-style': true,
      '@viewport': true,
      '@supports': true,
      '@region': true,
      '@navigation': true,
      '@footnote': true,
      '@layout': true,
      '@top': true,
      '@top-left': true,
      '@top-center': true,
      '@top-right': true,
      '@extend': true,
      '@if': true,
      '@elseif': true,
      '@else': true,
      '@for': true,
      '@dir': true,
      '@basename': true,
      '@extname': true,
      '@width': true,
      '@height': true
    }.hasOwnProperty(s)) {
      token.type(Token.VARS);
    }
  };
  self.addMatch(head);

  self.addMatch(new RegMatch(Token.VARS, /^@\{[\w\-\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376-\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0-\u08b2\u08e4-\u0963\u0966-\u096f\u0971-\u0983\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7-\u09c8\u09cb-\u09ce\u09d7\u09dc-\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a3c\u0a3e-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57\u0b5c-\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82-\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c58-\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5-\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1-\u0cf2\u0d01-\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82-\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2-\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18-\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772-\u1773\u1780-\u17d3\u17d7\u17dc-\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191e\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1ab0-\u1abd\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1cf8-\u1cf9\u1d00-\u1df5\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c-\u200d\u203f-\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099-\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua69d\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua7ad\ua7b0-\ua7b1\ua7f7-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\ua9e0-\ua9fe\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab5f\uab64-\uab65\uabc0-\uabea\uabec-\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe2d\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7]+\}/));
  self.addMatch(new RegMatch(Token.VARS, /^\$[\w\-\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376-\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0-\u08b2\u08e4-\u0963\u0966-\u096f\u0971-\u0983\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7-\u09c8\u09cb-\u09ce\u09d7\u09dc-\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a3c\u0a3e-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57\u0b5c-\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82-\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c58-\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5-\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1-\u0cf2\u0d01-\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82-\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2-\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18-\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772-\u1773\u1780-\u17d3\u17d7\u17dc-\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191e\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1ab0-\u1abd\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1cf8-\u1cf9\u1d00-\u1df5\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c-\u200d\u203f-\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099-\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua69d\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua7ad\ua7b0-\ua7b1\ua7f7-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\ua9e0-\ua9fe\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab5f\uab64-\uab65\uabc0-\uabea\uabec-\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe2d\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7]+/));
  self.addMatch(new RegMatch(Token.VARS, /^\$\{[\w\-\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376-\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0-\u08b2\u08e4-\u0963\u0966-\u096f\u0971-\u0983\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7-\u09c8\u09cb-\u09ce\u09d7\u09dc-\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a3c\u0a3e-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57\u0b5c-\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82-\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c58-\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5-\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1-\u0cf2\u0d01-\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82-\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2-\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18-\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772-\u1773\u1780-\u17d3\u17d7\u17dc-\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191e\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1ab0-\u1abd\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1cf8-\u1cf9\u1d00-\u1df5\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c-\u200d\u203f-\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099-\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua69d\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua7ad\ua7b0-\ua7b1\ua7f7-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\ua9e0-\ua9fe\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab5f\uab64-\uab65\uabc0-\uabea\uabec-\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe2d\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7]+\}/));

  self.addMatch(new CharacterSet(Token.SIGN, '{},:();-{}><+/[]=*~.'));
  self.addMatch(new CharacterSet(Token.HACK, '_`?|%'));
}).methods({
  values: function() {
    return this.vl;
  },
  colors: function() {
    return this.cl;
  },
  addValue: function(v) {
    this.vl[v] = true;
    return this.vl;
  },
  addColor: function(v) {
    this.cl[v] = true;
    return this.cl;
  }
}).statics({
  KEYWORDS: 'handler-blocked transform-3d -replace -set-link-source -use-link-source accelerator additive-symbols align-content align-items align-self alignment-adjust alignment-baseline anchor-point animation animation-delay animation-duration animation-fill-mode animation-iteration-count animation-name animation-play-state animation-timing-function app-region appearance ascent aspect-ratio autohiding-scrollbar azimuth backface-visibility background background-attachment background-clip background-color background-image background-origin background-origin-x background-origin-y background-position background-position-x background-position-y background-repeat background-size baseline baseline-shift behavior binding blend-mode block-progression bookmark-label bookmark-level bookmark-state bookmark-target border border-after border-after-color border-after-style border-after-width border-before border-before-color border-before-style border-before-width border-bottom border-bottom-color border-bottom-colors border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-clip-bottom border-clip-left border-clip-right border-clip-top border-collapse border-color border-fit border-horizontal-spacing border-image border-image-outset border-image-repeat border-image-slice border-image-source border-image-width border-left border-left-color border-left-colors border-left-style border-left-width border-radius border-radius-bottomleft border-radius-bottomright border-radius-topleft border-radius-topright border-right border-right-color border-right-colors border-right-style border-right-width border-spacing border-start border-start-color border-start-style border-start-width border-style border-top border-top-color border-top-colors border-top-left-radius border-top-right-radius border-top-style border-top-width border-vertical-spacing border-width bottom bottom-left-radius bottom-right-radius box box-align box-decoration-break box-direction box-flex box-flex-group box-lines box-ordinal-group box-orient box-pack box-reflect box-shadow box-sizing box-snap break-after break-before break-inside cap-height caption-side centerline chains clear clip clip-path clip-rule color color-correction color-index color-profile column-axis column-break-after column-break-before column-break-inside column-count column-fill column-gap column-progression column-rule column-rule-color column-rule-style column-rule-width column-span column-width columns content content-zoom-chaining content-zoom-limit content-zoom-limit-max content-zoom-limit-min content-zoom-snap content-zoom-snap-points content-zoom-snap-type content-zooming counter-increment counter-reset cue cue-after cue-before cursor dashboard-region definition-src descent device-aspect-ratio device-height device-pixel-ratio device-width direction display display-box display-extras display-inside display-outside dominant-baseline drop-initial-after-adjust drop-initial-after-align drop-initial-before-adjust drop-initial-before-align drop-initial-size drop-initial-value elevation empty-cells fallback fill fill-opacity fill-rule filter fit fit-position flavor flex flex-basis flex-direction flex-flow flex-grow flex-pack flex-shrink flex-wrap float float-edge float-offset flood-color flood-opacity flow-from flow-into focus-ring-color font font-color font-emphasize font-emphasize-position font-emphasize-style font-family font-feature-settings font-kerning font-language-override font-size font-size-adjust font-size-delta font-smooth font-smoothing font-stretch font-style font-synthesis font-variant font-variant-alternates font-variant-caps font-variant-east-asian font-variant-ligatures font-variant-numeric font-variant-position font-weight footnote force-broken-image-icon glyph-orientation-horizontal glyph-orientation-vertical grid grid-area grid-auto-columns grid-auto-flow grid-auto-rows grid-column grid-column-align grid-column-position grid-column-span grid-columns grid-definition-columns grid-definition-rows grid-position grid-row grid-row-align grid-row-position grid-row-span grid-rows grid-span grid-template hanging-punctuation height high-contrast high-contrast-adjust highlight horiz-align hyphenate-character hyphenate-limit-after hyphenate-limit-before hyphenate-limit-chars hyphenate-limit-last hyphenate-limit-lines hyphenate-limit-zone hyphenate-resource hyphens icon image-orientation image-rendering image-resolution images-in-menus ime-mode include-source inherit initial inline-box-align inline-flex inline-table input-format input-required interpolation-mode interpret-as justify-content justify-items justify-self kerning languages layer-background-color layer-background-image layout-flow layout-grid layout-grid-char layout-grid-char-spacing layout-grid-line layout-grid-mode layout-grid-type left letter-spacing lighting-color line-align line-box-contain line-break line-clamp line-grid line-height line-slack line-snap line-stacking line-stacking-ruby line-stacking-shift line-stacking-strategy linear-gradient link link-source list-image-1 list-image-2 list-image-3 list-style list-style-image list-style-position list-style-type locale logical-height logical-width mac-graphite-theme maemo-classic margin margin-after margin-after-collapse margin-before margin-before-collapse margin-bottom margin-bottom-collapse margin-collapse margin-end margin-left margin-right margin-start margin-top margin-top-collapse marker marker-end marker-mid marker-offset marker-start marks marquee marquee-dir marquee-direction marquee-increment marquee-loop marquee-play-count marquee-repetition marquee-speed marquee-style mask mask-attachment mask-box-image mask-box-image-outset mask-box-image-repeat mask-box-image-slice mask-box-image-source mask-box-image-width mask-clip mask-composite mask-image mask-origin mask-position mask-position-x mask-position-y mask-repeat mask-repeat-x mask-repeat-y mask-size mask-type match-nearest-mail-blockquote-color mathline max-aspect-ratio max-color max-color-index max-device-aspect-ratio max-device-height max-device-pixel-ratio max-device-width max-height max-logical-height max-logical-width max-monochrome max-resolution max-width max-zoom min-aspect-ratio min-color min-color-index min-device-aspect-ratio min-device-height min-device-pixel-ratio min-device-width min-height min-logical-height min-logical-width min-monochrome min-resolution min-width min-zoom mini-fold monochrome move-to nav-banner-image nav-bottom nav-down nav-down-shift nav-index nav-left nav-left-shift nav-right nav-right-shift nav-up nav-up-shift navbutton-* nbsp-mode negative none normal object-fit object-position oeb-column-number oeb-page-foot oeb-page-head opacity order orient orientation orphans osx-font-smoothing outline outline-color outline-offset outline-radius outline-radius-bottomleft outline-radius-bottomright outline-radius-topleft outline-radius-topright outline-style outline-width overflow overflow-scrolling overflow-style overflow-x overflow-y pad padding padding-bottom padding-left padding-right padding-top page page-break-after page-break-before page-break-inside page-policy panose-1 pause pause-after pause-before perspective perspective-origin perspective-origin-x perspective-origin-y phonemes pitch pitch-range play-during pointer-events position prefix presentation-level print-color-adjust progress-appearance property-name punctuation-trim punctuation-wrap quotes radial-gradient range region-break-after region-break-before region-break-inside region-overflow rendering-intent replace resize resolution rest rest-after rest-before richness right rotation-point row-span rtl-ordering ruby-align ruby-overhang ruby-position ruby-span scan script-level script-min-size script-size-multiplier scroll-chaining scroll-limit scroll-limit-x-max scroll-limit-x-min scroll-limit-y-max scroll-limit-y-min scroll-rails scroll-snap-points-x scroll-snap-points-y scroll-snap-type scroll-snap-x scroll-snap-y scroll-translation scrollbar-3d-light-color scrollbar-3dlight-color scrollbar-arrow-color scrollbar-base-color scrollbar-dark-shadow-color scrollbar-darkshadow-color scrollbar-end-backward scrollbar-end-forward scrollbar-face-color scrollbar-highlight-color scrollbar-shadow-color scrollbar-start-backward scrollbar-start-forward scrollbar-thumb-proportional scrollbar-track-color separator-image set-link-source shape-image-threshold shape-inside shape-margin shape-outside shape-padding shape-rendering size slope speak speak-as speak-header speak-numeral speak-punctuation speech-rate src stack-sizing stemh stemv stop-color stop-opacity stress string-set stroke stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width suffix svg-shadow symbols system tab-size tab-stops table-baseline table-border-color-dark table-border-color-light table-layout tap-highlight-color target target-name target-new target-position text-align text-align-last text-anchor text-autospace text-blink text-combine text-combine-horizontal text-decoration text-decoration-color text-decoration-line text-decoration-skip text-decoration-style text-decorations-in-effect text-effect text-emphasis text-emphasis-color text-emphasis-position text-emphasis-skip text-emphasis-style text-fill-color text-fit text-height text-indent text-justify text-justify-trim text-kashida text-kashida-space text-line-through text-orientation text-outline text-overflow text-rendering text-security text-shadow text-size-adjust text-space-collapse text-spacing text-stroke text-stroke-color text-stroke-width text-transform text-trim text-underline text-underline-color text-underline-position text-underline-style text-wrap top top-bar-button top-left-radius top-right-radius touch-action touch-callout touch-enabled transform transform-origin transform-origin-x transform-origin-y transform-origin-z transform-style transition transition-delay transition-duration transition-property transition-repeat-count transition-timing-function unicode-bidi unicode-range units-per-em use-link-source user-drag user-focus user-input user-modify user-select user-zoom vector-effect version vertical-align viewport visibility voice-balance voice-duration voice-family voice-pitch voice-pitch-range voice-range voice-rate voice-stress voice-volume volume white-space widows width widths will-change window-shadow windows-classic windows-compositor windows-default-theme word-break word-spacing word-wrap wrap wrap-flow wrap-margin wrap-padding wrap-through writing-mode x-height z-index zoom'.split(' '),
  VALUES: 'domain regexp farthest-corner closest-side closest-corner farthest-side above absolute additive all alpha alphabetic always and antialiased aqua armenian attr aural auto avoid background baseline behind below bicubic bidi-override black blink block blue bold bolder border-box both bottom braille break-all break-word calc canvas capitalize caption center center-left center-right circle cjk-decimal cjk-ideographic close-quote code collapse color compact condensed contain content-box continuous counter counters cover crop cross cross-fade crosshair cubic-bezier cursive cycle cyclic dashed decimal decimal-leading-zero default device-cmyk digits disabled disc disclosure-closed disclosure-open dotted double e-resize ease ease-in ease-in-out ease-out element embed embossed enabled expanded extra-condensed extra-expanded false fantasy far-left far-right fast faster fixed flipouttobottom flipouttoleft flipouttoright flipouttotop format fuchsia georgian gray grayscale green groove handheld hebrew help hidden hide high higher hiragana hiragana-iroha hsl hsla icon image image-rect image-region infinite inherit inline inline-table inset inside inter-ideograph invert italic japanese-formal japanese-informal justify katakana katakana-iroha korean-hangul-formal korean-hanja-formal korean-hanja-informal landscape large larger leader left-side leftwards level lighter lime line-through linear linear-gradient list-item local loud low lower lower-alpha lower-greek lower-latin lower-roman lowercase ltr marker maroon medium message-box middle min max mix move n-resize narrower navy ne-resize no-close-quote no-open-quote no-repeat none normal not nowrap numeric nw-resize oblique olive once only opacity open-quote outset outside overline padding-box pending perspective pointer portrait pre print projection purple rebeccapurple rect red relative repeat repeat-x repeat-y repeating-linear-gradient repeating-radial-gradient rgb rgba ridge right right-side rightwards rotate rotate3d rotate3D rotateX rotateY rotateZ round rounddown roundup rtl run-in running s-resize scale scale3D scale3d scaleX scaleY scaleZ screen scroll se-resize semi-condensed semi-expanded separate show silent silver simp-chinese-formal simp-chinese-informal skew skew3D skewX skewY skewZ slow slower small small-caps small-caption smaller soft solid space speech spell-out square static status-bar steps string sub super sw-resize symbolic symbols table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group target-counter target-counters target-pull target-text teal text text-bottom text-top thick thin toggle top trad-chinese-formal trad-chinese-informal translate translate3d translate3D translateX translateY translateZ true tty tv ultra-condensed ultra-expanded underline upper-alpha upper-latin upper-roman uppercase url url-prefix var visible w-resize wait white wider width x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow'.split(' '),
  COLORS: 'transparent activeborder aliceblue antiquewhite appworkspace aqua aqua aquamarine azure beige bisque black black blanchedalmond blue blue blueviolet brown burlywood buttonface buttonshadow cadetblue captiontext chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia fuchsia gainsboro ghostwhite gold goldenrod gray gray green green greenyellow grey highlight honeydew hotpink inactiveborder inactivecaptiontext indianred indigo infotext ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime lime limegreen linen magenta maroon maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred menutext midnightblue mintcream mistyrose moccasin navajowhite navy navy oldlace olive olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple purple red red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal teal thistle threeddarkshadow threedhighlight threedshadow tomato turquoise violet wheat white white whitesmoke windowframe yellow yellow yellowgreen'.split(' '),
  addKeyWord: function(kw) {
    if(Array.isArray(kw)) {
      CssRule.KEYWORDS = CssRule.KEYWORDS.concat(kw);
    }
    else {
      CssRule.KEYWORDS.push(kw.trim());
    }
  },
  addValue: function(v) {
    if(Array.isArray(v)) {
      CssRule.VALUES = CssRule.VALUES.concat(v);
    }
    else {
      CssRule.VALUES.push(v.trim());
    }
  },
  addColor: function(v) {
    if(Array.isArray(v)) {
      CssRule.COLORS = CssRule.COLORS.concat(v);
    }
    else {
      CssRule.COLORS.push(v.trim());
    }
  }
});
module.exports = CssRule;});