<?php 
    header('Access-Control-Allow-Origin: *');    
    header('Access-Control-Allow-Headers:  *');
    header('Access-Control-Allow-Methods:  *'); 
    define ('SITE_ROOT', realpath(dirname(__FILE__)));

    $servername = "db";
    $database = "funpills";
    $username = "root";
    $password = "password";
    $port = "3306";

    $conn = new mysqli($servername, $username, $password,$database,$port);
    if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

    getcwd().DIRECTORY_SEPARATOR;
    $post_image_dir = getcwd().DIRECTORY_SEPARATOR."/imgs/postImgs/";

    function generateError($msg,$errorCode=0){
        return '{"code":'.$errorCode.',"msg":"'.$msg.'"}';
    }
?>
