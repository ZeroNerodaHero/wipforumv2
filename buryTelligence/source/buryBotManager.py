from .serverConn import serverConn
from .buryTelligence import buryTelligence
import mysql.connector


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
        else:
            self.respondToLatestPost()

    def respondToLatestPost(self):
        res = self.myConn.myQuery(que="SELECT threadReference,messageId,messageContent FROM messageList \
                                    WHERE messageOwner != -1 and ((buryBotCode>>1)&1) != 1 ORDER BY messageId DESC LIMIT 1")[0];
        newMsg = self.bot.get_most_similar_response(res[2])
        print(res[1])
        newMsg = ("#"+str(res[1])+"\n"+newMsg)
        self.myConn.myQuery(que="INSERT INTO messageList(threadReference,messageContent,messageOwner,userReference,hashed_ip,buryBotCode) \
                                VALUES(%s,%s,-1,-1,-1,1)",values=(res[0],newMsg))
        self.myConn.myQuery(que="UPDATE messageList \
                                SET buryBotCode=(buryBotCode | (1<<1)) \
                                WHERE messageId={}".format(str(res[1])))
        self.myConn.updateSQL()