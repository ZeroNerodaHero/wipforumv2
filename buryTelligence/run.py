from source.serverConn import serverConn
from source.buryTelligence import buryTelligence

import os
folder_path = "botScrape/"
json_files = [file for file in os.listdir(folder_path) if file.endswith('.json')]
#sort -> assume later dataset contains the new info
json_files.sort(reverse = True)
print(json_files)

myConn = serverConn()

bot = buryTelligence(folder_path=folder_path,json_files=json_files,debug=True)
bot.debugSimulate()
