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
            print("connected to server")
            self.conn = self.connection.cursor()

            que = "SELECT * FROM messageList"
            self.conn.execute(que)
            
            results = self.conn.fetchall()
            for row in results:
                print(row)
        except mysql.connector.Error as err:
            print("Error:", err)    






