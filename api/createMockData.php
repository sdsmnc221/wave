<?php
    include "./Helper.php";
    header("Access-Control-Allow-Origin: *");
    global $pdo;
    $host = "localhost";
    $port = "8889";
    $db   = "TempEau";
    $user = "root";
    $pass = "root";
    $charset = "utf8mb4";
    $dsn = "mysql:host=" .$host. ";port=" .$port. ";dbname=" .$db. ";charset=" .$charset;
    $opt = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
    try {
        $helper = new Helper();
        $pdo = new PDO($dsn, $user, $pass, $opt);
        $tables = ["Chlore", "OxyConcentration", "Oxygene", "pH", "Pression", "Salinite", "TempeAir", "TempeEau"];
        $sql = "INSERT INTO %s(valeurs) VALUES (:value)";
        $sql_lo = "UPDATE LiveOverview SET Data=:value WHERE NomData=:type";
        for ($i = 0; $i <= 80; $i++) {
            foreach($tables as $table) {
                $value = $helper->random_float();
                if ($value === "pH") {
                    while($value < -14 || $value > -14) {
                        $value = $helper->random_float();
                    }
                }

                //Create mock data for specific data"s table & update LiveOverview Table
                $stmt = $pdo->prepare(sprintf($sql, $table));
                $stmt_lo = $pdo->prepare($sql_lo);
                $stmt->execute([":value" => $value]);
                $stmt_lo->execute([
                    ":value" => $value,
                    ":type" => $table
                ]);
                echo(sprintf("INSERT successful into %s.<br>", $table));
            }
        }
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
    }
?>
