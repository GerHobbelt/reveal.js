/*
Language: OCaml
Contributors: Nicolas Braud-Santoni <nicolas.braud-santoni@ens-cachan.fr>
*/
function(hljs) {
  return {
      keyword:
        'and as assert asr begin class constraint do done downto else end ' +
        'inherit initializer land lazy let lor lsl lsr lxor match method ' +
        'mod module mutable new object of open or private rec ref sig struct ' +
      built_in:
        'bool char float int list unit array exn option int32 int64 nativeint ' +
        'format4 format6 lazy_t in_channel out_channel string',
    },
    illegal: /\/\//,
    contains: [
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      {
      },
      {
        excludeEnd: true,
      },
      {
        className: 'class',
        keywords: 'type',
        contains: [
          {
            className: 'title',
            begin: hljs.UNDERSCORE_IDENT_RE
          }
        ]
      },
      {
        className: 'annotation',
        begin: '\\[<', end: '>\\]'
      },
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),
      hljs.C_NUMBER_MODE
    ]
}
