<?php 
class Helper {
    public function __consctruct() {}
    
    public function random_float ($min=0, $max=100) {
        return ($min+lcg_value()*(abs($max-$min)));
     }
}


//SET Headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

//MAIN
// include '/api/APICore.php';

class APICore {
    protected $_api_url;
    protected $_db;
    protected $_queries;
    protected $_helper;
    protected $_types;

    public function __construct(
        string $queries,
        string $api_url = "http://localhost:8888/wave/dist/api.php") {
        $this->_api_url = $api_url;
        $this->_db = $this->make_db(); 
        $this->_queries = $this->make_queries($queries);
        $this->_types = $this->make_types();
        $this->_helper = new Helper();
    }

    public function make_db() {
        header("Access-Control-Allow-Origin: *");
        global $pdo;
        $host = $_ENV["host"];
        $port = $_ENV["port"];
        $db   = $_ENV["db"];
        $user = $_ENV["user"];
        $pass = $_ENV["pass"];
        $charset = "utf8mb4";
        $dsn = "mysql:host=" .$host. ";port=" .$port. ";dbname=" .$db. ";charset=" .$charset;
        $opt = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
        try {
         return $pdo = new PDO($dsn, $user, $pass, $opt);
        } catch (PDOException $e) {
         return "Connection failed: " . $e->getMessage();
        }
    }

    public function get_db() {
        return $this->_db;
    }

    public function destroy_db() {
        $this->_db = null;
    }

    public function make_queries(string $serialized_queries) {
        $queries = [];
        if ($serialized_queries !== "") {
            $temp = explode("&", $serialized_queries);
            foreach ($temp as $serialized_query) {
                $query = explode("=", $serialized_query);
                $queries = array_merge($queries, array($query[0] => $query[1]));
            }

        }
        return $queries;
    }

    public function get_queries() {
        return $this->_queries;
    }

    public function make_types() {
       return ["Chlore", "OxyConcentration", "Oxygene", "pH", "Pression", "Salinite", "TempeAir", "TempeEau"];
    }

    public function create_table() {
        if ($this->_queries["create_table"] === "true") {
            $result = $this->_queries;
            
            return json_encode($result);
        }
    }

    public function create_mock_data() {
        if ($this->_queries["create_mock_data"] === "true") {
            // $sql_lo = "INSERT INTO LiveOverview(NomData, Data) VALUES (:type, :value)";
            // $stmt_lo = $this->_db->prepare($sql_lo);
            // foreach($this->_types as $type) {
            //     $value = $this->_helper->random_float();
            //     echo $type;
                
            //     // Create mock data for LiveOview table for the first time
            //     $stmt_lo->execute([
            //         ":type" => $type,
            //         ":value" => $value
            //     ]);
            //     echo(sprintf("INSERT successful %s into LiveOverView.<br>", $type));
            // }

            $sql = "INSERT INTO %s(valeurs) VALUES (:value)";
            $sql_lo = "UPDATE LiveOverview SET Data=:value WHERE NomData=:type";
            for ($i = 0; $i <= 20; $i++) {
                foreach($this->_types as $type) {
                    $value = $this->_helper->random_float();
    
                    //Create mock data for specific data"s table & update LiveOverview Table
                    $stmt = $this->_db->prepare(sprintf($sql, $type));
                    $stmt_lo = $this->_db->prepare($sql_lo);
                    $stmt->execute([":value" => $value]);
                    $stmt_lo->execute([
                        ":value" => $value,
                        ":type" => $type
                    ]);
                    echo(sprintf("INSERT successful into %s.<br>", $type));
                }
            }

            return "INSERT successful.";
            $this->destroy_db();
        }
    }


    public function create_data() {
        $result = array("error" => "Can not insert new data to the database.");
        if ($this->_queries["create_data"] === "true") {
            $result = array("success" => "Insert successful.");
            $data = array_diff_key($this->_queries, array("create_data" => null));
            foreach ($data as $type=>$value) {
                if (in_array($type, $this->_types)) {
                    $sql = "INSERT INTO %s(valeurs) VALUES (:value)";
                    $sql_lo = "UPDATE LiveOverview SET Data=:value WHERE NomData=:type";

                    $stmt = $this->_db->prepare(sprintf($sql, $type));
                    $stmt_lo = $this->_db->prepare($sql_lo);

                    $stmt->execute([":value" => $value]);
                    $stmt_lo->execute([
                        ":value" => $value,
                        ":type" => $type
                    ]);

                    $result = array_merge($result, array($type=>$value));
                }
            }
        }
        return json_encode($result);
    }

    public function read_latest(string $type) {
        $result = array("error" => "No type matched.");
        if (in_array($type, $this->_types)) {
            $sql = "SELECT * FROM %s ORDER BY ID DESC LIMIT 1";
            $stmt = $this->_db->prepare(sprintf($sql, $type));
            $stmt->execute();
            $result = $stmt->fetch();
        } 
        return json_encode($result);
    }

    public function read_all(string $type) {
        $result = array("error" => "No type matched.");
        if (in_array($type, $this->_types)) {
            $sql = "SELECT * FROM %s ORDER BY ID DESC";
            $stmt = $this->_db->prepare(sprintf($sql, $type));
            $stmt->execute();
            $result = $stmt->fetchAll();
        } 
        return json_encode($result);
    }

    public function read_lo() {
        $result = [];
        foreach($this->_types as $type) {
            $_type = array("type" => $type);
            $_result = (array) json_decode($this->read_latest($type));
            $result[] = array_merge($_type, $_result);
        }
        return json_encode($result);
    }
    
}

$api = new APICore($_SERVER["QUERY_STRING"]);
$queries = $api->get_queries();

if ($api->get_db() instanceof PDO && sizeof($queries) > 0) {
    if (array_key_exists("create_mock_data", $queries)) {
        echo $api->create_mock_data();
    }
    if (array_key_exists("read_latest", $queries)) {
        echo $api->read_latest($queries["read_latest"]);
    }
    if (array_key_exists("read_all", $queries)) {
        echo $api->read_all($queries["read_all"]);
    }
    if (array_key_exists("read_lo", $queries)) {
        echo $api->read_lo();
    }
    if (array_key_exists("create_data", $queries)) {
        echo $api->create_data();
    }
    if (array_key_exists("create_table", $queries)) {
        echo $api->create_table();
    }
    $api->destroy_db();
}


?>