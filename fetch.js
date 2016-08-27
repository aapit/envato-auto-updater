var http = require('http');
var url = require('url');
var request = require('request');
var urlLib = require('./url_lib');
var env = require('./env');
var auth = require('./auth');


function getLocalPort() {
    return urlLib.getPort(env.client.url);
}

function displayStart(req, res, apiBaseUrl) {
    var redirectUrl = env.client.url + '/auth-confirm';
    var approveUrl = apiBaseUrl + '/authorization?response_type=code'
        + '&client_id=' + env.client.id
        + '&redirect_uri=' + redirectUrl
    ;

    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write('<h1>Envato Auto-Uploader</h1>');
    res.write('<a href="' + approveUrl + '">'
        + 'Approve API access for the auto-downloader.</a>');
    res.end("\n");
}

function postRequest(req, res, requestToken, apiBaseUrl) {
    var onPostResponse = function(error, res, body) {
        if (!error && res.statusCode == 200) {
            onResponse(body)
        }
    }

    var requestUrl = apiBaseUrl + '/token';
    var postData = {
        'grant_type': 'authorization_code',
        'code': requestToken,
        'client_id': env.client.id,
        'client_secret': env.client.secret
    };

    request.post(
        {
            url: requestUrl,
            form: postData
        },
        onPostResponse
    );
}

/**
 * Receive the response to the authentication request.
 * @param String body The json response object
 * @return Void
 */
function onResponse(body) {
    auth.set(body);
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
        displayStart(req, res, apiBaseUrl);
    }
}

var server = http.createServer(onRequest);
server.listen(getLocalPort());

console.log('Visit ' + env.client.url + ' to approve API access to Envato.');
