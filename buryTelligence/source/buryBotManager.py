from .serverConn import serverConn
from .buryTelligence import buryTelligence
import mysql.connector
import time
import random


class buryBotManager:
    """
    This class manages the connection between the chatbot and the server. It takes in the following constructor parameters.

    Args:
        folder_path(string): The location of the json_files
        json_files(list of string): The list of json_files
        debug(bool): Debug on or not.
        option(int): Option. If debug is true, option does nothing
    """
    def __init__(self,folder_path,json_files,debug=False,option=0):
        self.myConn = serverConn()

        self.bot = buryTelligence(folder_path=folder_path,json_files=json_files,debug=debug)
        
        self.printCat()
        if(debug == True):
            print("You are simulating. No changes will be made to the server")
            self.bot.debugSimulate()
        elif(option == 1):
            print("Burybot is going to respond to the latest post")
            self.respondToLatestPost()
        elif(option == 2):
            print("Burybot is going to work very hard to post to everyone")
            self.runForevea()
        else:
            print("Burybot is lazy and going to go to sleep")
            self.doNothing()

    def respondToLatestPost(self):
        serverResponse = self.myConn.myQuery(que="SELECT threadReference,messageId,messageContent FROM messageList \
                                            WHERE messageOwner != -1 and ((buryBotCode>>1)&1) != 1 ORDER BY messageId DESC LIMIT 1");
        if(serverResponse == None):
            return -1
        if(len(serverResponse) == 0):
            return 1

        res = serverResponse[0]

        print("[-] replying to post "+str(res[1])+"...")

        newMsg = self.bot.get_most_similar_response(res[2])
        newMsg = ("#"+str(res[1])+"\n"+newMsg)
        self.myConn.myQuery(que="INSERT INTO messageList(threadReference,messageContent,messageOwner,userReference,hashed_ip,buryBotCode) \
                                VALUES(%s,%s,-1,-1,-1,1)",values=(res[0],newMsg))
        #extra comma for tuple definition
        self.myConn.myQuery(que="UPDATE threadList \
                                SET threadSize = threadSize+1 \
                                WHERE threadId=%s",values=(res[0],))
        self.myConn.myQuery(que="UPDATE messageList \
                                SET buryBotCode=(buryBotCode | (1<<1)) \
                                WHERE messageId={}".format(str(res[1])))
        self.myConn.updateSQL()
        print("[+] finish replying to post "+str(res[1]))
        return 0

    def runForevea(self):
        timer = input("Minutes inbetween each post \n>>> ")
        timer = 60*float(timer)
        print("Will add a new post every: "+str(timer)+"sec")

        shutdown = input("Shutdown? Type 0 to shutdown. Else, type minutes till next check\n>>> ")
        shutdown = 60*float(shutdown)

        while(1):
            print("\nCURRENT TIME: ",time.ctime())
            tmp = self.respondToLatestPost();
            if(tmp == -1): break
            elif(tmp == 0): time.sleep(timer)
            elif(tmp == 1): 
                if(shutdown == 0): break
                else: 
                    print("Bot FELL ASLEEP...")
                    time.sleep(shutdown)
                    self.restartConnection()
                    print("Bot WOKE UP 0<:O")

    def restartConnection(self):
        self.myConn = serverConn()

    def doNothing(self):
        print("Initialization complete...\nEverything should work. Please use:")
        print_highlighted("docker compose run --rm burybot [opt]")
        print("to run your burybot")
        return

    def printCat(self):
        eyes = ["o","-",".","V","/",]
        randomEye = random.randint(0,len(eyes)-1)
        cheeks = ["//","==","..","  "]
        randomCheek = random.randint(0,len(cheeks)-1)

        print(34*"_")
        print("This is your not so random cat...")
        print("    /\_____/\\")
        print("   /  {}   {}  \\".format(eyes[randomEye],eyes[randomEye]))
        print("  ( {}  ^  {} )".format(cheeks[randomCheek],cheeks[randomCheek]))
        print(34*"_")

def print_highlighted(text, color="white", background="light_grey"):
    colors = {
        "black": "30",
        "red": "31",
        "green": "32",
        "yellow": "33",
        "blue": "34",
        "magenta": "35",
        "cyan": "36",
        "white": "37",
        "grey": "90",        
        "light_grey": "37"
    }
    backgrounds = {
        "black": "40",
        "red": "41",
        "green": "42",
        "yellow": "43",
        "blue": "44",
        "magenta": "45",
        "cyan": "46",
        "white": "47"
    }

    color_code = colors.get(color, "33")  # Default to yellow if color is not recognized
    background_code = backgrounds.get(background, "40")  # Default to black if background is not recognized

    try:
        highlighted_text = f"\033[{color_code};{background_code}m{text}\033[0m"
        print(highlighted_text)
    except:
        # If formatting fails (no ANSI support), print the text without formatting
        print(text)


