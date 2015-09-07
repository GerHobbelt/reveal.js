#! /bin/bash
#
# recursively collect the currently active commit / branch name and
# write them to a shell script for later use on other
# machines (and keeping the info in the destination repository)
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
dstfile="$wd/util/checkout_to_known_git_branches_recursive.sh"

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

ddir=$( dirname "$dstfile" )

usn=$( basename "$dstfile" )

cat > "$dstfile" <<EOT
#! /bin/bash
#
# Generated by the utility: $0 $*
#
# Checkout each git repository to the given branch/commit or list them
#

mode=h;
while getopts ":hlc" opt ; do
  #echo opt+arg = "\$opt\$OPTARG"
  case "\$opt\$OPTARG" in
  l )
    mode=h;
    ;;

  c )
    mode=c;
    ;;

  r )
    mode=r;
    ;;

  * )
    cat <<EOH
$usn options

Options:

-h      : print this help 
-l      : LIST the branch/commit for each git repository (directory) registered in this script.
-c      : CHECKOUT each git repository to the BRANCH registered in this script.
-r      : CHECKOUT/REVERT each git repository to the COMMIT registered in this script.

Note:

Use the '-r' option to set each repository to an exact commit position, which is useful if,
for instance, you wish to reproduce this registered previous software state (which may 
represent a software release) which you wish to analyze/debug.

EOH
    exit 1;
    ;;
  esac
done

if test "\$mode" = "h" ; then
  cat <<EOH

Git repository directory                    :: commit hash                         / branch name
--------------------------------------------::--------------------------------------------------
EOH
fi



# args: DIR COMMIT [BRANCH]
git_repo_checkout_branch() {
  if test "\$mode" = "c" || test "\$mode" = "r" ; then
    if test -d "\$1" ; then
      pushd "\$1"                                                               2> /dev/null  > /dev/null
      if test "\$mode" = "c" && test -n "\$3" ; then
        # make sure the branch is created locally and is a tracking branch:
        git branch --track "\$3" "remotes/origin/\$3"                            2> /dev/null  > /dev/null
        git checkout "\$3"
      else
        git checkout "\$2"
      fi
      popd                                                                     2> /dev/null  > /dev/null
    fi
  else
    if test -d "\$1" ; then
      printf "%-43s :: %s / %s\n" "\$1" "\$2" "\$3"
    else
      printf "%-43s :: %s / %s\n" "[DIRECTORY DOES NOT EXIST!] \$1" "\$2" "\$3"
    fi
  fi
}


#
# Make sure we switch to the utility directory as all the relative paths for the repositories
# are based off that path!
#
pushd \$(dirname \$0)                                                            2> /dev/null  > /dev/null



#
# The registered repositories:
#

EOT

git submodule foreach --quiet $@ "$utildir/__collect_git_checked_out_branch_helper__.sh" "$ddir" | sort >> "$dstfile"

cat >> "$dstfile" <<EOT

# --- all done ---

popd                                                                           2> /dev/null  > /dev/null

EOT

popd                                                                                                    2> /dev/null  > /dev/null
