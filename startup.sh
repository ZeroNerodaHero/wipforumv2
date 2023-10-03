#!/bin/bash
containerList=()

bold_text(){
    local text="$1"
    echo -e "\e[1m$text\e[0m"
}
getContainers(){
    containerList=()
    while IFS= read -r line; do
        containerList+=("$line")        
    done < <(docker compose ps -q)
}

while true; do
    getContainers
    bold_text "option:"
    read -p "> " input
    bold_text "==============================================\n"
    if [ "$input" == "start" ]; then
        bold_text "Starting up containers"
        docker compose up --build db --build backend -d
        bold_text "Finished Building. Running in background"
    elif [ "$input" == "status" ]; then
        bold_text "Managing:"
        for id in "${containerList[@]}"; do
            echo "$id"
        done
    elif [ "$input" == "stop" ]; then
        for id in "${containerList[@]}"; do
            echo "stopping $id"
            docker stop $id
            bold_text "stopped $id"
        done
        
    elif [ "$input" == "exit" ]; then
        break
    else
        bold_text "nothing";
    fi

    bold_text "\n=============================================="
done

