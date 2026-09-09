#!/usr/bin/env bash
nohup \
mongosh 'mongodb+srv://_username_here_:_password_here_@_cluster_uri_here' \
bkt.js > bkt.log 2>&1 &
