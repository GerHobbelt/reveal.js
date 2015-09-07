#! /bin/bash
#
# recursively collect registered git remotes and
# write them to a shell script for later use on other
# machines (and keeping the info in the repository)
#

wd="$( pwd )";

pushd $(dirname $0)                                                                                     2> /dev/null  > /dev/null
utildir="$( pwd )";

# go to root of project
cd ..

wd=$( $utildir/print-git-repo-base-directory.sh "$wd" )
echo "git repository base directory: $wd"
cd "$wd"

if ! test -d "$wd/util" ; then
    mkdir "$wd/util"
fi
dstfile="$wd/util/register_git_remotes_recursive.sh"

echo "dstfile: $dstfile"

# you may specify, for example, '--recursive' on the commandline:
if test $# != 0 ; then
    cat <<EOT

  Extra GIT SUBMODULE FOREACH parameters:

     $@

EOT
else
    cat <<EOT

  No extra GIT SUBMODULE FOREACH parameters: executing a single-level submodule remotes
  collection.


  Note: If you wish to run a RECURSIVE collection, please specify the 
    --recursive
  commandline parameter!

EOT
fi

git submodule foreach $@ git remote -v | gawk -f "$utildir/collect_git_remote_add_recusively.awk" > "$dstfile"

popd                                                                                                    2> /dev/null  > /dev/null
