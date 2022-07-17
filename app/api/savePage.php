<?php
session_start();
if($_SESSION['auth'] != true) {         
    header("HTTP/1.0 403 Forbidden");
    die;                            
}

$_POST = json_decode(file_get_contents("php://input"), true);
$file = $_POST['pageName'];
$newHTML = $_POST['html'];  

$backups = json_decode(file_get_contents('../backups/backups.json'));
if (!is_array($backups)) {   
    $backups = [];
}

if ($newHTML && $file) {
    $backupsName = uniqid() . '.html';
    copy("../../" . $file, '../backups/' . $backupsName); 
    array_push($backups, ['page' => $file, 'file' => $backupsName, 'time' => date('H:i:s d:m:Y')]); 
    file_put_contents('../backups/backups.json', json_encode($backups)); 
    file_put_contents("../../" . $file, $newHTML);  
} else {
    header("HTTP/1.0 400 Bad Request");  
}