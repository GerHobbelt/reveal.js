/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

function(hljs) {
  var VARIABLE = {
    className: 'variable', begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
  };
  var STRINGS = [
    hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
    hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),
    {
      className: 'string',
      begin: 'b"', end: '"',
      contains: [hljs.BACKSLASH_ESCAPE]
    },
    {
      className: 'string',
      begin: 'b\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ];
  var NUMBERS = [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE];
  var TITLE = {
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE
  };
  return {
    case_insensitive: true,
    lexems: hljs.UNDERSCORE_IDENT_RE,
    keywords:
      'and include_once list abstract global private echo interface as static endswitch ' +
      'array null if endwhile or const for endforeach self var while isset public ' +
      'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
      'return implements parent clone use __CLASS__ __LINE__ else break print eval new ' +
      'catch __METHOD__ case exception default die require __FUNCTION__ ' +
      'enddeclare final try this switch continue endfor endif declare unset true false ' +
      'namespace trait goto instanceof insteadof __DIR__ __NAMESPACE__ ' +
      'yield finally',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      {
        className: 'comment',
        begin: '/\\*', end: '\\*/',
        contains: [{
            className: 'phpdoc',
            begin: '\\s@[A-Za-z]+'
        }]
      },
      {
          className: 'comment',
          begin: '__halt_compiler.+?;', endsWithParent: true,
          keywords: '__halt_compiler', lexems: hljs.UNDERSCORE_IDENT_RE
      },
      {
        className: 'string',
        begin: '<<<[\'"]?\\w+[\'"]?$', end: '^\\w+;',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        subLanguage: 'xml',
        begin: '\\?>', end: '<\\?php',
        excludeBegin: true, excludeEnd: true
      },
      {
        className: 'preprocessor',
        begin: '<\\?php',
        relevance: 10
      },
      {
        className: 'preprocessor',
        begin: '\\?>'
      },
      {
        className: 'namespace',
        beginWithKeyword: true, end: ';',
        keywords: 'namespace',
        excludeEnd: true
      },
      {
        className: 'alias',
        beginWithKeyword: true, end: ';',
        keywords: 'use',
        excludeEnd: true,
        contains: [
          {
            lexems: '[a-zA-Z\\\\][a-zA-Z0-9_\\\\]*',
            className: 'keyword',
            begin: '[a-zA-Z0-9_\x7f-\xff\\\\]+'
          }
        ]
      },
      VARIABLE,
      {
        className: 'keyword',
        begin: '(->|\\-\\-|\\+\\+|\\-|\\+|\\*|/|%|(!|&&|\\|\\|)|<<|>>|~|\\^|&|\\||===|==|!==|!=|<=|>=|<>|<|>|\\.=|\\.|=)'
      },
      {
        className: 'literal',
        begin: '(true|false|null|__(class|dir|f(ile|unction)|line|method|namespace|trait)__|\\b(on|off|yes|no|nl|br|tab)\\b)'
      },
      {
        className: 'class',
        lexems: '',
        begin: '[a-zA-Z0-9_\x7f-\xff]+::+',
        returnBegin: true,
        contains: [
          {
            className: 'keyword',
            begin: '[a-zA-Z0-9_\x7f-\xff]+'
          }
        ]
      },
      {
        className: 'keyword',
        begin: '::'
      },
      {
        className: 'function',
        beginWithKeyword: true, end: '{',
        keywords: 'function',
        illegal: '\\$|\\[|%',
        contains: [
          {
            className: 'corefunction',
            begin: '(?:(__(?:call|(?:con|de)struct|get|(?:is|un)?set|tostring|clone|set_state|sleep|wakeup|autoload)))'
          },
          TITLE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              'self',
              VARIABLE,
              hljs.C_BLOCK_COMMENT_MODE
            ].concat(STRINGS).concat(NUMBERS)
          }
        ]
      },
      {
        className: 'class',
        beginWithKeyword: true, end: '{',
        keywords: 'class',
        illegal: '[:\\(\\$]',
        contains: [
          {
            beginWithKeyword: true, endsWithParent: true,
            keywords: 'extends interface',
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        begin: '=>' // No markup, just a relevance booster
      }
    ].concat(STRINGS).concat(NUMBERS)
  };
}
