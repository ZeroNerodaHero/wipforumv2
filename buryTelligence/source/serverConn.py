import mysql.connector

class serverConn():
    def __init__(self):
        self.dbConfig = {
            "host":"db",
            "user":"root",
            "password":"password",
            "database":"funpills",
            "port":"3306"
        }
        try:
            self.connection = mysql.connector.connect(**self.dbConfig)
            print("Connected to server")
            self.conn = self.connection.cursor()
            
        except mysql.connector.Error as err:
            print("Failed to Connect\nError:", err) 

    def __del__(self):
        self.conn.close()
        self.connection.close()  

    def myQuery(self,que,values=(),commit=False):
        try:
            self.conn.execute(que,values)
        except (mysql.connector.Error , mysql.connector.Warning) as e:
            print(e)
            return None
        if(commit == True): self.connection.commit()
        return self.conn.fetchall()

    def updateSQL(self):
        self.connection.commit()







