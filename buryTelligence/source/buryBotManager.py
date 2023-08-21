from .serverConn import serverConn
from .buryTelligence import buryTelligence
import mysql.connector
import time


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
        
        if(debug == True):
            self.bot.debugSimulate()
        elif(option == 1):
            self.respondToLatestPost()
        elif(option == 2):
            self.runForevea()
        else:
            self.doNothing()

    def respondToLatestPost(self):
        serverResponse = self.myConn.myQuery(que="SELECT threadReference,messageId,messageContent FROM messageList \
                                            WHERE messageOwner != -1 and ((buryBotCode>>1)&1) != 1 ORDER BY messageId DESC LIMIT 1");
        if(serverResponse == None or len(serverResponse) == 0):
            print("ERROR: PROBABLY NO POST LEFT")
            return -1

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
        return 1

    def runForevea(self):
        timer = input("Minutes inbetween each post \n>>>")
        timer = 60*float(timer)
        while(1):
            if(self.respondToLatestPost() == -1): break
            time.sleep(timer)
            
    def doNothing(self):
        print("Everything should work. Please use \n\tdocker compose run --rm burybot [opt]\n to run your burybot")
        return