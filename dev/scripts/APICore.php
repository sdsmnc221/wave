<?php 
include "./Helper.php";

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
        $host = "127.0.0.1";//"mysql.hostinger.fr";
        $port = "8889"; //""; 
        $db   = "TempEau"; //"850201821_wave"; 
        $user = "root"; //"u850201821_Awave"; //
        $pass = "root"; //"wave2018"; 
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

    public function create_mock_data() {
        if ($this->_queries["create_mock_data"] === "true") {
            $sql = "INSERT INTO %s(valeurs) VALUES (:value)";
            //$sql_lo = "INSERT INTO LiveOverview(NomData, Data) VALUES (:type, :value)";
            //$stmt_lo = $this->_db->prepare($sql_lo);
            for ($i = 0; $i <= 20; $i++) {
                foreach($this->_types as $type) {
                    $value = $this->_helper->random_float();
    
                    //Create mock data for specific data"s table
                    $stmt = $this->_db->prepare(sprintf($sql, $type));
                    $stmt->execute([":value" => $value]);
                    echo(sprintf("INSERT successful into %s.<br>", $type));
                    
                    //Create mock data for LiveOview table
                    // $stmt_lo->execute([
                    //     ":type" => $table,
                    //     ":value" => $value
                    // ]);
                    // echo(sprintf("INSERT successful %s into LiveOverView.<br>", $table));
                }
            }

            return "INSERT successful.";
            $this->destroy_db();
        }
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
?>