USE funpills;
CREATE TABLE userList(
    userId BIGINT,
    userName varchar(64) UNIQUE,
    password varchar(64),
    accountPerm TINYINT DEFAULT 0,
    userExp int DEFAULT 0,
    status varchar(256),
    authKey int,
    loginDate timeStamp ON UPDATE CURRENT_TIMESTAMP,
    creationDate timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_hashedLoginIp varchar(64)
);
CREATE TABLE messageList(
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
    /*
        -bit 0 -> is bot reply
        -bit 1 -> bot has replied to post

        //btw the backend container will not use this. only buryBot
    */
    buryBotCode int DEFAULT 0,
    primary key (messageId)
);
CREATE TABLE threadList(
    threadTitle varchar(200),
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
    boardCode int NOT NULL AUTO_INCREMENT,
    shortHand varchar(10) UNIQUE,
    longHand varchar(100),
    boardDesc varchar(1000),
    boardImg varchar(400),

    boardBday timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    boardOwner BIGINT DEFAULT 0,
    
    boardPermPost TINYINT DEFAULT 0,
    boardPermView TINYINT DEFAULT 0,

    boardPriority TINYINT DEFAULT 0,

    p2p bool DEFAULT false,
    isPrivate bool DEFAULT false,
    threadCap int DEFAULT 100,

    primary key (boardCode)
);
CREATE TABLE bannedIps(
    hashed_ip varchar(64) UNIQUE,
    reason varchar(400),
    startTime timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expireTime timeStamp
);
CREATE TABLE cooldownPostTimer(
    hashed_ip varchar(64) UNIQUE,
    startTime timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expireTime timeStamp
);
INSERT INTO userList(userId,userName,password,accountPerm,last_hashedLoginIp) 
    VALUES(1,"eve","eve",99,0);
INSERT INTO boardList(shortHand,longHand,threadCap,boardPriority,boardDesc)
    VALUES("h","home",300,99,
        "This is the home board. There really is no topic.");
INSERT INTO boardList(shortHand,longHand,boardPriority, boardDesc)
    VALUES("m","meta",98,
        "Meta is for users to post about the site. Please post bugs or errors here.");
INSERT INTO threadList(threadTitle,boardReference,permLevel,threadPriority,threadOP,firstPostLink)
    VALUES("G","h",98,100,0,1);
INSERT INTO messageList(threadReference,messageContent,messageOwner,imageLinks)
    VALUES(1,"This is hello world from me, eve!!! :33 <- double chin fat cat",1,"https://media.discordapp.net/attachments/700130094844477561/948468498726809600/1646150889277.png");
INSERT INTO threadList(threadTitle,boardReference,permLevel,threadPriority,threadOP,firstPostLink)
    VALUES("Welcome to Meta.","m",98,100,0,2);
INSERT INTO messageList(threadReference,messageContent,messageOwner,imageLinks)
    VALUES(2,"talk to the wall",
        1,"https://cdn.discordapp.com/attachments/482613781818769408/1075656517879078942/IMG_8995.jpg");
