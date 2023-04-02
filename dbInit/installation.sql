USE funpills;
CREATE TABLE userList(
    userId BIGINT,
    userName varchar(60) UNIQUE,
    password varchar(60),
    accountPerm TINYINT DEFAULT 0,
    userExp int DEFAULT 0,
    status varchar(256),
    authKey int,
    loginDate timeStamp ON UPDATE CURRENT_TIMESTAMP,
    creationDate timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE messageList(
    threadReference int,
    imageLinks varchar(1000),
    messageContent varchar(2000),
    messageOwner BIGINT,

    messageId int NOT NULL AUTO_INCREMENT,
    postTime timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    primary key (messageId)
);
CREATE TABLE threadList(
    threadTitle varchar(100),
    boardReference varchar(10),
    threadOP BIGINT,
    firstPostLink int,

    threadDeco json,

    threadId int NOT NULL AUTO_INCREMENT,
    permLevel TINYINT DEFAULT 0,
    threadPriority TINYINT DEFAULT 0,
    creationTime timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    threadSize int DEFAULT 0,
    updateTime timeStamp ON UPDATE CURRENT_TIMESTAMP,

    primary key (threadId)
);
CREATE TABLE boardList(
    boardCode int,
    shortHand varchar(10),
    longHand varchar(100),

    boardBday timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    boardOwner BIGINT DEFAULT 0,
    
    boardPermPost TINYINT DEFAULT 0,
    boardPermView TINYINT DEFAULT 0,

    boardPriority TINYINT DEFAULT 0,

    p2p bool DEFAULT false,
    isPrivate bool DEFAULT false,
    threadCap int DEFAULT 100
);
INSERT INTO userList(userId,userName,password,accountPerm) 
    VALUES(0,"eve","eve",99);
INSERT INTO boardList(boardCode,shortHand,longHand,boardPermPost,threadCap,boardPriority)
    VALUES(0,"h","home",98,3000,99);
INSERT INTO boardList(boardCode,shortHand,longHand,boardPriority)
    VALUES(1,"m","meta",98);
INSERT INTO threadList(threadTitle,boardReference,permLevel,threadPriority,threadOP,firstPostLink)
    VALUES("Get fun pills","h",98,100,0,1);
INSERT INTO messageList(threadReference,messageContent,messageOwner,imageLinks)
    VALUES(1,"This is hello world from me, eve!!! :33 <- double chin fat cat",0,"https://media.discordapp.net/attachments/700130094844477561/948468498726809600/1646150889277.png");
