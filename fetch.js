var http = require('http');
var url = require('url');
var UrlPattern = require('url-pattern');

if (
    process.env.ENVATO_CLIENT_ID === undefined ||
    process.env.ENVATO_CLIENT_URL === undefined
) {
    var errorEnvMissing = "Missing one of the environment variables:\n"
        + "ENVATO_CLIENT_ID (for instance 'fast-wp-auto-updater-2lk1d0920')\n"
        + "ENVATO_CLIENT_URL (for instance 'http://localhost.example.com:8888')\n"
    ;
    throw new Error(errorEnvMissing);
}

function getPort() {
    var pattern = new UrlPattern('(http(s)\\://)(:subdomain.):domain.:tld(\\::port)(/*)')
    return pattern.match(process.env.ENVATO_CLIENT_URL).port;
}

function onRequest(request, response) {
    var apiBaseUrl = 'https://api.envato.com/';
    var queryData = url.parse(request.url, true).query;
    console.log(request.url);

    if (request.url.indexOf('/auth-confirm') === 0) {
        // User is redirected after approving Envato API access
        var requestToken = queryData.code;

        response.writeHead(302, {'Location': '/'});
        response.end();
    } else {
      var redirectUrl = '/auth-confirm';
      var approveUrl = apiBaseUrl + 'authorization?response_type=code'
                     + '&client_id=' + process.env.ENVATO_CLIENT_ID
                     + '&redirect_uri=' + redirectUrl
      ;

      response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
      response.write('<h1>Envato Auto-Uploader</h1>');
      response.write('<a href="' + approveUrl + '">Approve API access for the auto-downloader.</a>');
      response.end("\n");
    }
}

var server = http.createServer(onRequest);
server.listen(getPort());

console.log('Visit ' + process.env.ENVATO_CLIENT_URL + ' to approve API access to Envato.');
