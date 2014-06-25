var http = require('http');
var url = require('url');
var querystring = require('querystring');
var webserver = require('./webserver');

var postCommands =
{
    '/savefile' : webserver.saveTextFile,
    '/saveimage' : webserver.saveImage,
};


http.createServer(function(request, response)
{
    console.log('request starting...: ' + request.url);


    var p = url.parse(request.url);

    if (request.method == "GET")
    {
        webserver.proecss(request, response);
    }
    else if (request.method == "POST")
    {
        var q = querystring.parse(p.query);
        console.log(q);
        var body = '';
        var bufferList = [];
        var bufferLen = 0;
        request.on('data', function (data)
        {
            if (Buffer.isBuffer(data))
            {
                bufferList.push(data);
                bufferLen += data.length;
            }
            else
                body += data;
            console.log("data = ", data);
        });
        request.on('end', function ()
        {
            console.log("body = ", body);
            var buffer;
            if (bufferLen > 0)
            {
                buffer = new Buffer(bufferLen);
                var len = 0;
                for (var i = 0; i < bufferList.length; i++)
                {
                    bufferList[i].copy(buffer, len);
                    len += bufferList[i].length;
                }
            }

            var data =
            {
                text : body,
                buffer : buffer
            };

            var func = postCommands[p.pathname];
            if (func)
            {
                func(q, data, response);
            }
            else
            {
                response.writeHead(500);
                response.end("Unknown command!");
            }

            //{"val1":"hello","val2[val3]":"world"}
        });
    }
}).listen(8888);