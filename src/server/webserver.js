var fs = require('fs');
var path = require('path');
var PNG = require('pngjs').PNG;

var contentTypes =
{
    '.htm'  : 'text/html; charset=UTF-8',
    '.html' : 'text/html; charset=UTF-8',
    '.js'   : 'text/javascript; charset=UTF-8',
    '.css'  : 'text/css; charset=UTF-8',
    '.xml'  : 'text/xml; charset=UTF-8',
    '.txt'  : 'text/plain; charset=UTF-8',
    '.cfg'  : 'text/plain; charset=UTF-8',
    '.glsl' : 'text/plain; charset=UTF-8',
    '.png'  : 'image/png',
    '.jpg'  : 'image/jpeg',
    '.jepg' : 'image/jpeg',
    '.bmp'  : 'image/bmp',
    '.gif'  : 'image/gif'
};

function process(request, response)
{
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

   // console.log('webserver: ' + filePath);

    var extname = path.extname(filePath).toLowerCase();
    var contentType = contentTypes[extname];
    if (!contentType)
        contentType = 'application/octet-stream';

    console.log(extname + " : "  + contentType);

    path.exists(filePath, function(exists)
    {
        if (exists)
        {
            fs.readFile(filePath, function(error, content)
            {
                if (error)
                {
                    if (error.errno === 34)
                    {
                        response.statusCode = 404;
                    }
                    else
                    {
                        response.statusCode = 500;
                    }
                    response.end()
                }
                else
                {
                    response.writeHead(200,
                        { 'Content-Type' : contentType, 'Cache-Control' : 'max-age=10' }
                    );

                    response.end(content, 'utf-8');
                }
            });
        }
        else
        {
            response.writeHead(404);
            response.end();
        }
    });
}

function saveTextFile(q, data, response)
{
    fs.writeFile(q.filename, data.text, function(err)
        {
            if (err)
            {
                response.writeHead(500);
                response.end(err.message);
            }
            else
            {
                response.writeHead(200);
                response.end("Success");
            }
        });
}

function saveImage(q, data, response)
{
    var width = parseInt(q.width) || 0;
    var height = parseInt(q.height) || 0;

    if (width <= 0 || height <= 0)
    {
        response.writeHead(500);
        response.end("width or height error");
        return;
    }

    if (!data.buffer || data.buffer.length != width * height * 4)
    {
        response.writeHead(500);
        response.end("data length error");
        return;
    }


    var png = new PNG({ width : width, height : height });

    data.buffer.copy(png.data, 0);

    var out = fs.createWriteStream(q.filename);
    png.pack().pipe(out);
    response.writeHead(200);
    response.end("Success");
}

exports.proecss = process;
exports.saveTextFile = saveTextFile;
exports.saveImage = saveImage;