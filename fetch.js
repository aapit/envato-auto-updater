var http = require('http');
var url = require('url');
var UrlPattern = require('url-pattern');
var querystring = require('querystring');

if (
    process.env.ENVATO_CLIENT_ID === undefined ||
    process.env.ENVATO_CLIENT_URL === undefined ||
    process.env.ENVATO_CLIENT_SECRET === undefined
) {
    var errorEnvMissing = "Missing one of the environment variables:\n"
        + "ENVATO_CLIENT_ID (for instance 'fast-wp-auto-updater-2lk1d0920')\n"
        + "ENVATO_CLIENT_URL (for instance 'http://localhost.example.com:8888')\n"
        + "ENVATO_CLIENT_SECRET (for instance '3lkj2f2va2sd98Wmei1d9g38')\n"
    ;
    throw new Error(errorEnvMissing);
}

function getLocalPort() {
    return getPort(process.env.ENVATO_CLIENT_URL);
}

function getPort(url) {
    return parseUrl(url).port;
}

function getDomain(url) {
    return parseUrl(url).subdomain + '.'
        + parseUrl(url).domain + '.'
        + parseUrl(url).tld
    ;
}

function parseUrl(url) {
    var pattern = new UrlPattern('(http(s)\\://)(:subdomain.):domain.:tld(\\::port)(/*)')
    return pattern.match(url);
}

function displayHome(request, response, apiBaseUrl) {
    var redirectUrl = process.env.ENVATO_CLIENT_URL + '/auth-confirm';
    var approveUrl = apiBaseUrl + 'authorization?response_type=code'
                 + '&client_id=' + process.env.ENVATO_CLIENT_ID
                 + '&redirect_uri=' + redirectUrl
    ;

    response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    response.write('<h1>Envato Auto-Uploader</h1>');
    response.write('<a href="' + approveUrl + '">Approve API access for the auto-downloader.</a>');
    response.end("\n");
}

function postRequest(request, response, requestToken, apiBaseUrl) {
    var requestPath = '/token';
    var post_data = querystring.stringify({
        'grant_type': 'authorization_code',
        'code': requestToken,
        'client_id': process.env.ENVATO_CLIENT_ID,
        'client_secret': process.env.ENVATO_CLIENT_SECRET
    });

    var post_options = {
        host: getDomain(apiBaseUrl),
        port: getPort(apiBaseUrl),
        path: requestPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
        });
    });

    post_req.write(post_data);
    post_req.end();
}

function onRequest(request, response) {
    var apiBaseUrl = 'https://api.envato.com/';
    var queryData = url.parse(request.url, true).query;
    console.log('Incoming path request: ' + request.url);

    if (request.url.indexOf('/auth-confirm') === 0) {
        // User is redirected after approving Envato API access
        var requestToken = queryData.code;
        postRequest(request, response, requestToken, apiBaseUrl);

        //response.end();
    } else {
        displayHome(request, response, apiBaseUrl);
    }
}

var server = http.createServer(onRequest);
server.listen(getLocalPort());

console.log('Visit ' + process.env.ENVATO_CLIENT_URL + ' to approve API access to Envato.');
