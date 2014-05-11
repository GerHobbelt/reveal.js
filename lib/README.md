# What goes where in `lib/`?

## General policy

> In here all third party assets go.

> We use submodules, but we do not depend on them.

That translates to:

1. all the submodules we use, we copy their important (i.e. dearly needed) bits into `lib/_/` (the underscore dir is our 'assets collective store')

   Reason: we don't want the submodules' examples, test files, etc. around when we put the bugger on a live server, so we desire total and utter control.
   This is done by using a grunt script to copy the important bits from a developer's submodule-ridden workdir tree into the `lib/_/` assets store
   which itself is just another part of this here repository itself, y'all.

2. when submodules need some sort of wicked preprocessing before they're actually useful, e.g. adding UMD wrappers or some such, than the
   the grunt copy script from item (1) above takes care of that matter while copying: the processed stuff ends up in `lib/_/`. Of course you *may*
   want to hold off some processing, such as LESS to CSS compiling, 'till the very end. In that case, the LESS files are considered an 'important bit'
   as per item (1) above and end up in the `lib/_/` assets store per the same decree.


## lib/plugins/

Here's where the libs land which are required by any one of the reveal.js plugins (but not by reveal.js itself)


## lib/js/

The LZ for any JavaScript which is required by reveal.js at some time or other: it's rather anything else which is *not specific to a particular plugin*.

Yes, it's a bit of a mess. We started with a `lib/js` and a `lib/plugins` and then sat down to bend the rule to match reality. A fine example of
software dev' *Realpolitik* in action, I'd say.


## lib/???/

Well, I *did* mention *Realpolitik*, didn't I? There's some stuff in here that still needs to be dusted. Till then, we live it up and don't mind too much. 
As Al Pacino would say: "Woohah!"

