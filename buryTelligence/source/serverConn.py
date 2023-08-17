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

    def myQuery(self,que,commit=False):
        self.conn.execute(que)
        if(commit == True): self.connection.commit()
        return self.conn.fetchall()







