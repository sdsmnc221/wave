<?php
header("Access-Control-Allow-Origin: *");

$host = "localhost";
$db   = "TempEau";
$user = "root";
$pass = "";
$charset = "utf8mb4";

global $pdo;
$dsn = "mysql:host=" .$host. ";dbname=" .$db. ";charset=" .$charset;
$opt = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
       ];
try {
  $pdo = new PDO($dsn, $user, $pass, $opt);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>
