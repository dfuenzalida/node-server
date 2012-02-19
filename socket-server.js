var pg = require('pg');
var net = require('net');

var conString = "tcp://wami:wami@localhost/node";
var client = new pg.Client(conString);
client.connect();

var server = net.createServer(function (stream) {

    stream.on('end', function () {
        stream.end('goodbye\r\n');
    });

    stream.on('data', function(data){

        try {
            console.log("Recibido: " + data);
            var map = JSON.parse(data + "\n");
            var id  = parseInt(map["id"]);
            var lat = parseFloat(map["lat"]);
            var lon = parseFloat(map["lon"]);

            client.query("INSERT INTO locations(id, lat, lon, ts) values ($1, $2, $3, NOW())",
                          [id, lat, lon]);

            stream.write(JSON.stringify({"status": "ok"}) + "\n");

        } catch (err) {
            stream.write(JSON.stringify({"status": "error"}) + "\n");
            console.log(err.toString());
        }

    });

});

server.listen(7001);

console.log("Central server running on port " + server.address().port);
