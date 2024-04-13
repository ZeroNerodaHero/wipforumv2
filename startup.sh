#!/bin/bash
containerList=()
entryContainer="wipforumv2-backend-1"

tabPrint(){
    local tab="$1"
    local text="$2"
    local ret=""
    while [ "$tab" -gt 0 ]; do
        ret+="\t"
        tab=$((tab - 1))
    done
    ret+="$text"
    printf "$ret\n"
}
bold_text(){
    local text="$1"
    printf "\e[1m$text\e[0m\n"
}
getContainers(){
    containerList=()
    while IFS= read -r line; do
        containerList+=("$line")        
        entryContainer=$(docker ps -q -f "label=service=backend-entry")
    done < <(docker compose ps -q)
}
printHelp(){
    bold_text "optcodes "
    bold_text "1. status"
    tabPrint 2 "Displays the status of actively running containers"
    bold_text "2. start"
    tabPrint 2 "Starts minimum needed containers(db,backend)"
    bold_text "3. stop"
    tabPrint 2 "Stops all containers"
    bold_text "4. update"
    tabPrint 2 "Executes a git pull"
}

while true; do
    getContainers
    bold_text "option:"
    read -p "> " input
    bold_text "==============================================\n"
    if [ "$input" == "start" ]; then
        bold_text "Starting up containers"
        docker compose up --build db --build backend -d --build redis --build express
        bold_text "Finished Building. Running in background"
    elif [ "$input" == "start bot" ]; then
        bold_text "Starting bot"
    elif [ "$input" == "status" ]; then
        bold_text "Managing:"
        container_filter=""
        for id in "${containerList[@]}"; do
            container_filter+="-f id=$id "
        done
        docker ps $container_filter --format \
            'table {{.ID}}\t{{.Image}}\t{{.RunningFor}}\t{{.Size}}\t{{.Label "service"}}\t{{.Networks}}'
    elif [ "$input" == "stats" ]; then
        bold_text "Stats:"
        docker stats
    elif [ "$input" == "stop" ]; then
        for id in "${containerList[@]}"; do
            bold_text "stopping $id"
            docker stop $id
            bold_text "stopped $id"
        done
    elif [ "$input" == "enter" ]; then
        bold_text "Entering container $entryContainer"
        docker exec -it $entryContainer "/bin/sh" 
        bold_text "Exited container $entryContainer"
    elif [ "$input" == "enter db" ]; then
        bold_text "Entering database through $entryContainer"
        docker exec -it $entryContainer mysql -u root -h db funpills
        bold_text "Exited container $entryContainer"
    elif [ "$input" == "update" ]; then
        git pull
    
            
    elif [ "$input" == "help" ]; then
        printHelp
    elif [ "$input" == "exit" ]; then
        break
    else
        bold_text "nothing";
    fi

    bold_text "\n=============================================="
done

