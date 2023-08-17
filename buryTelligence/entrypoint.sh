#!/bin/bash
if [ "$1" = "debug" ]; then
    python3 /root/run.py debug
else
    python3 /root/run.py
fi