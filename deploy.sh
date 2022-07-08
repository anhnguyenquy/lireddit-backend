#!/bin/bash

read -p "What should the version be? " VERSION
docker build -t anhnguyenquy/lireddit:$VERSION .
docker push anhnguyenquy/lireddit:$VERSION
ssh admin@54.179.207.146 -i /home/anq/.ssh/Admin.pem "sudo docker pull anhnguyenquy/lireddit:$VERSION && sudo dokku git:from-image backend anhnguyenquy/lireddit:$VERSION"