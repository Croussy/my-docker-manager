#!/bin/bash
sudo rm /var/run/docker.pid
sudo docker daemon -H localhost:31337 
