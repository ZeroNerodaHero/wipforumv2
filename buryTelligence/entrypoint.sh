#!/bin/bash
if [ "$1" = "debug" ]; then
    python3 /root/run.py debug
elif [ "$1" = "test" ]; then
    python3 /root/run.py test
elif [ "$1" = "run" ]; then
    python3 /root/run.py run
else
    python3 /root/run.py
    echo "HALP: \ndebug,test,run"
fi