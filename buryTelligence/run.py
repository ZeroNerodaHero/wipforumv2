from source.buryBotManager import buryBotManager
import os
folder_path = "botScrape/"
json_files = [file for file in os.listdir(folder_path) if file.endswith('.json')]
#sort -> assume later dataset contains the new info
json_files.sort(reverse = True)

import sys
arg = ""
if len(sys.argv) > 1:
    arg = sys.argv[1]

debug = False
option = 0
if(arg == ""):
    option = 0
elif(arg == "debug"):
    debug = True


bot = buryBotManager(folder_path=folder_path, json_files=json_files,debug=debug,option=option)

