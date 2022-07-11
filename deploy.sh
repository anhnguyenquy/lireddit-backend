#!/bin/bash

docker build -t anhnguyenquy/lireddit:latest .
docker push anhnguyenquy/lireddit:latest
ssh admin@54.179.207.146 -i /home/anq/.ssh/Admin.pem "sudo docker pull anhnguyenquy/lireddit:latest && sudo dokku git:from-image backend anhnguyenquy/lireddit:latest"