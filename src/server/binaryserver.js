var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');


function startBinaryServer(server)
{
    var binaryserver = new BinaryServer({server: server, path: '/binary-endpoint'});

    // Wait for new user connections
    server.on('connection', function(client){
        // Stream a flower as a hello!
        var file = fs.createReadStream(__dirname + '/flower.png');
        client.send(file);
    });

}


// Start Binary.js server
var server = BinaryServer({port: 9000});

