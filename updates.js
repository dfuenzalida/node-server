var pg = require('pg');
var http = require('http');
var url = require('url');
var fs = require('fs');

var conString = "tcp://wami:wami@localhost/node";

http.createServer(function (req, res) {

    console.log(req.url);

    if (req.url.indexOf('?') > -1){

        // res.writeHead(200, {'Content-Type': 'application/json'});
        res.writeHead(200, {'Content-Type': 'text/html'});

        var client = new pg.Client(conString);
        client.connect();

        // request updates to the locations table newer than N secs ago
        var query = client.query("SELECT * FROM locations WHERE ts > current_timestamp - interval '30 second' ORDER BY ts ASC")

        var locations = []

        query.on('row', function(row) {
            // console.log("*** " + row.id + " -> " + row.ts);
            var location = {id: row.id, lat: row.lat, lon: row.lon, ts: row.ts};
            locations[locations.length] = location;
        });

        query.on('end', function(){
            var output = JSON.stringify(locations, "", " ");
            console.log(output);
            res.end(output);
            client.end();
        });

    } else {

        // index page
        fs.readFile("index.html", function(err,data){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });

    }

}).listen(8080, "127.0.0.1");


console.log('Server running at http://127.0.0.1:8080/index.html');

