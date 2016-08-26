var http = require('http');
var url = require('url');
var UrlPattern = require('url-pattern');
var request = require('request');

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

function displayHome(req, res, apiBaseUrl) {
    var redirectUrl = process.env.ENVATO_CLIENT_URL + '/auth-confirm';
    var approveUrl = apiBaseUrl + '/authorization?response_type=code'
                 + '&client_id=' + process.env.ENVATO_CLIENT_ID
                 + '&redirect_uri=' + redirectUrl
    ;

    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write('<h1>Envato Auto-Uploader</h1>');
    res.write('<a href="' + approveUrl + '">Approve API access for the auto-downloader.</a>');
    res.end("\n");
}

function postRequest(req, res, requestToken, apiBaseUrl) {
    var onPostResponse = function(error, res, body) {
        if (!error && res.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
        }
    }

    var requestUrl = apiBaseUrl + '/token';
    var postData = {
        'grant_type': 'authorization_code',
        'code': requestToken,
        'client_id': process.env.ENVATO_CLIENT_ID,
        'client_secret': process.env.ENVATO_CLIENT_SECRET
    };

    request.post(
        {
            url: requestUrl,
            form: postData
        },
        onPostResponse
    );
}

function onRequest(req, res) {
    var apiBaseUrl = 'https://api.envato.com';
    var queryData = url.parse(req.url, true).query;
    console.log('Incoming path request: ' + req.url);

    if (req.url.indexOf('/auth-confirm') === 0) {
        // User is redirected after approving Envato API access
        var requestToken = queryData.code;
        postRequest(req, res, requestToken, apiBaseUrl);

        //res.end();
    } else {
        displayHome(req, res, apiBaseUrl);
    }
}

var server = http.createServer(onRequest);
server.listen(getLocalPort());

console.log('Visit ' + process.env.ENVATO_CLIENT_URL + ' to approve API access to Envato.');
