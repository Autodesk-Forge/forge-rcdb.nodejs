#!/bin/sh

heroku config:set NODE_ENV=production --app forge-rcdb
heroku config:set FORGE_CLIENT_ID=$FORGE_CLIENT_ID --app forge-rcdb
heroku config:set FORGE_CLIENT_SECRET=$FORGE_CLIENT_SECRET --app forge-rcdb
heroku config:set RCDB_DBHOST=$RCDB_DBHOST --app forge-rcdb
heroku config:set RCDB_PORT=$RCDB_PORT --app forge-rcdb
heroku config:set RCDB_DBNAME=$RCDB_DBNAME --app forge-rcdb
heroku config:set RCDB_USER=$RCDB_USER --app forge-rcdb
heroku config:set RCDB_PASS=$RCDB_PASS --app forge-rcdb
