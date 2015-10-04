#!/usr/bin/env bash

LOCKFILE="/home/git/www/blue.cse.buffalo.edu/deploy.lock"
LOCKFD=99

# PRIVATE
_lock()             { flock -$1 $LOCKFD; }
_no_more_locking()  { _lock u; _lock xn && rm -f $LOCKFILE; }
_prepare_locking()  { eval "exec $LOCKFD>\"$LOCKFILE\""; trap _no_more_locking EXIT; }

_prepare_locking

exlock_now()        { _lock xn; }
exlock()            { _lock x; }
shlock()            { _lock s; }
unlock()            { _lock u; }

exlock_now || ( echo "Deploy in progress. Exiting." || exit 1 )
sleep 60
