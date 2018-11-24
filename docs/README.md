# WAVE

Dashboard Interface for WAVE (Water Analysis for Vietnamese Ecosystem)'s data output.

> https://antr.tech/wave/
> 

# Getting Started

Nothing here.

At least git clone the whole repository.

# Back-end

## Server

You will need a server that comes with PHP, MySQL installed. It is recommended to use WAMP / MAMP / LAMP since PHPMyAdmin also came with it.

## Database

Base Database is **_TempEau.sql_**, just create a new database and import the file (PHPMyAdmin or something else, your choice).

You can create / modify tables or tables' data with PHPMyAdmin, it's the simplest way. The Backend API written in PHP also provides a way to do the same thing.

## API

### APICore

Almost of the API's structure lies in **_APICore.php_** (modify the one in _/dist_ if you don't do Javascript) (a class). This file returns an APICore object, documented below.

_\$this->_ will be omitted, so for instance if it's written **\_api_url** it means **\$this->\_api_url** in the PHP code.

#### Constructor

The APICore's constructor takes 2 params:

| Param                   | Explanation                                                                             |
| ----------------------- | :-------------------------------------------------------------------------------------: |
| **$queries** _(string)_ | Raw queries string from GET method (check **_queries** property and api.php part below) |
| **$api_url**            | Default URL to access the API (we mostly ignore this property).                         |

#### Properties

| Property      | Explanation                                                                                                                                                                                                           |
| ------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| **\_api_url** | Default URL to access the API (we mostly ignore this property).                                                                                                                                                       |
| **\_db**      | PDO Object. Database / Connection to Database will be created with **make_db()** method, then stored in this property. You will need to have access to this in order to make changes to your database.                |
| **\_queries** | Queries sent to the API by GET method (or by adding params to the API url, for instance _my.api.com**?query1=abc&query2=def**_). This property will be set up and sanitized for usage with **make_queries()** method. |
| **\_types**   | Types, or technically (most) of the tables' names. This property will be set up with **make_types()** method.                                                                                                         |
| **\_helpers** | The Helper object, which stores utils function (go read **Helper.php** yourself).                                                                                                                                     |

#### Methods

**make_db()**
This method establishes the connection to the database by creating a [PDO](http://php.net/manual/en/pdo.connections.php) instance with provided configs. It will be called immediately in the consctrutor so we have nothing to do with it, except for changing configs so you can access to the right database.

| Config    | Explanation                                                                      |
| --------- | :------------------------------------------------------------------------------: |
| **$host** | MySQL Server's host (_localhost_ if local server).                               |
| **$port** | MySQL Server's port (_8889_ on MAMP, null (empty string _""_) or _3306_ on WAMP. |
| **$db**   | Database's name.                                                                 |
| **$user** | User (_root_ if local server).                                                   |
| **$pass** | Password (_root_ if MAMP, _""_ if WAMP).                                         |

**get_db()**
This method returns the **_db** property (or get the PDO instance).

**destroy_db()**

This method destroys the PDO instance (or set **_db** to null). It's always a good practice to destroy the connection to the database after done with everything.

***

**make_queries()**

This method sanitize the raw queries string, and turns it to an array of queries. 

For instance, from _my.api.com**?query1=abc&query2=def**_ we got the queries string **?query1=abc&query2=def**, and this method returns **["query1" => "abc", "query2" => "def]**. 

This method will be called immediately in the consctrutor so we have nothing to do with it.

**get_queries()**

This method returns the **_queries** property (or the queries array).

***

**make_types()**

This method defines the types of data existed in the database. It will be called immediately in the consctrutor so we have nothing to do with it.

If you want to know what are these types, go look for the exact same string in your database. Either it will be a table's name, or a table's column.

***

**create_table()**

...Forget it, do it with PHPMyAdmin, forgot the code for this one.

***

**create_mock_data()**

If **?create_mock_data=true** _(explicitly write **=true** in the URL, as will be explained in API's URL part)_, this methods will seed the whole database _(LiveOverview table + every other tables defines in **_types** with 20 mock data (by default is 20).

**create_data()**

If **?create_mock_data=true** _(explicitly write **=true** in the URL, as will be explained in API's URL part)_, this methods will insert data in every tables defines in **_types** and also the more complexed LiveOverview table.

The params will be something like **?create_data=true&Chlore=1&Oxygene=1&Somethingelse=1**, or **["Chlore" => 1, "Oxygene" => 1, "Somethingelse" => 1]**.

***

**read_latest(_string_ $type)**

This methods returns in JSON format the latest (or last) piece of data in the provided **$type** (table).

Default is 1 result (_LIMIT 1_).

The params will be something like **?read_latest=Chlore**.

**read_all(_string_ $type)**

This methods returns in JSON format all data in the provided **$type** (table).

Default order is from newest to oldest (_ORDER BY ID **DESC**_).

The params will be something like **?read_all=Chlore**.

**read_lo()**

This methods returns in JSON format all types (or tables, except for LiveOverview)' latest piece of data.

Default order is from newest to oldest (_ORDER BY ID **DESC**_).

The params will be something like **?read_lo=true**.

The result:

`
[{"type":"Chlore","ID":82,"Valeurs":9.9775200000000001665512172621674835681915283203125,"time":"2018-07-02 04:23:35"},{"type":"OxyConcentration","ID":82,"Valeurs":45.1058000000000021145751816220581531524658203125,"time":"2018-07-02 04:23:35"},{"type":"Oxygene","ID":82,"Valeurs":34.4620000000000032969182939268648624420166015625,"time":"2018-07-02 04:23:35"},{"type":"pH","ID":82,"Valeurs":87.7874000000000052068571676500141620635986328125,"time":"2018-07-02 04:23:35"},{"type":"Pression","ID":82,"Valeurs":64.1280000000000001136868377216160297393798828125,"time":"2018-07-02 04:23:35"},{"type":"Salinite","ID":82,"Valeurs":87.49070000000000391082721762359142303466796875,"time":"2018-07-02 04:23:35"},{"type":"TempeAir","ID":82,"Valeurs":3.021549999999999958077978590154089033603668212890625,"time":"2018-07-02 04:23:35"},{"type":"TempeEau","ID":82,"Valeurs":99.622600000000005593392415903508663177490234375,"time":"2018-07-02 04:23:35"}]
`

#### PDO-styled syntaxes

**Basic**

1. Write your SQL query, with placeholder (_:placeholder_).
2. Prepare your SQL query (for security reasons etc.).
3. Execute your SQL query, with exec() if no result expected or executed() if you want to replace your _:placeholder_ with actual _$value_.

***

**INSERT and UPDATE queries**

`
//INSERT & Multiple values
$value1 = "toto";
$value2 = "titi";
$sql = "INSERT INTO table(column1, column2) VALUES (:value1, :value2)";
$stmt = $this->_db->prepare($sql);
$stmt->execute([
    ":value1" => $value1,
    ":value2" => $value2,
]);
`

`
//UPDATE & Single value
$value = "toto";
$sql = "UPDATE table SET column=:value WHERE id=1";
$stmt = $this->_db->prepare($sql);
$stmt->execute([":value" => $value]);
`

***

**SELECT query**

`
//Fetch many results
$sql = "SELECT * FROM table";
$stmt = $this->_db->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll();
foreach($results as $key->$value) {
    echo $value;
}
`

`
//Fetch single result
$sql = "SELECT * FROM table LIMIT 1";
$stmt = $this->_db->prepare($sql);
$stmt->execute();
$result = $stmt->fetch();
echo $result;
`

### API & API URL

You implement the API by creating an APICore instance here in this file **api.php**. The API's url is the path to **api.php**.

When calling **new APICore(...)**, you pass **$_SERVER["QUERY_STRING"]** as the **_string_ $queries** param.

The API only works when and only when the connection to the database is established AND there are queries passed in the URL (_my.api.com**?query1=abc&query2=def**_).

`if ($api->get_db() instanceof PDO && sizeof($queries) > 0) {}`

It will then test further if the **trigger param** exist and / or is correct. If it does, the APICore's method with **the same name** as the trigger param will be called.

# Front-end

## Development Environment

- Terminal.
- [Node.js](https://nodejs.org/en/).

...








