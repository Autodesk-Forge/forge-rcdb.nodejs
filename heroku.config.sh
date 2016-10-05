#!/bin/sh

heroku config:set NODE_ENV=production
heroku config:set FORGE_CLIENT_ID=$FORGE_CLIENT_ID
heroku config:set FORGE_CLIENT_SECRET=$FORGE_CLIENT_SECRET
heroku config:set RCDB_DBHOST=$RCDB_DBHOST
heroku config:set RCDB_PORT=$RCDB_PORT
heroku config:set RCDB_DBNAME=$RCDB_DBNAME
heroku config:set RCDB_USER=$RCDB_USER
heroku config:set RCDB_PASS=$RCDB_PASS
