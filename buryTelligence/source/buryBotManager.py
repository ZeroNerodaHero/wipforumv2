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
                                    WHERE messageOwner != -1 ORDER BY messageId DESC LIMIT 1")[0];
        newMsg = self.bot.get_most_similar_response(res[2])
        print(res[2])
        newMsg = ("#"+str(res[1])+"\n"+newMsg)
        print("INSERT INTO messageList(threadReference,messageContent,messageOwner,userReference,hashed_ip) \
                                VALUES('{}','{}',-1,-1,-1)".format(res[0],newMsg))
        self.myConn.myQuery(que="INSERT INTO messageList(threadReference,messageContent,messageOwner,userReference,hashed_ip) \
                                VALUES('{}','{}',-1,-1,-1)".format(res[0],newMsg),commit=True)
        

'''
        threadReference int,
    imageLinks varchar(1000),
    messageContent varchar(3000),
    messageOwner BIGINT,
    hashed_ip varchar(64),

    userReference BIGINT,

    messageId int NOT NULL AUTO_INCREMENT,
    postTime timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    /* 
        -bit 0 -> report
        -bit 1 -> report immunity
    */
    isReported bit(2) NOT NULL DEFAULT 0,
    primary key (messageId)
'''

        