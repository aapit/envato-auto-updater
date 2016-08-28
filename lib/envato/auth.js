var request = require('request');
var urlLib = require('../tools/url');
var env = require('../envato/env');

module.exports = {
    apiBaseUrl:     'https://api.envato.com',
    refreshToken:   null,
    accessToken:    null,
    expiresAt:      null,

    /**
     * Sets the auth variables from the Envato auth response.
     */
    setTokens: function(resStr) {
        var res = JSON.parse(resStr);

        this.refreshToken   = res.refresh_token;
        this.accessToken    = res.access_token;
        this.expiresAt      = this.now() + res.expires_in;
    },

    now: function() {
        return Math.floor(Date.now() / 1000);
    },

    hasAccess: function() {
        return this.accessToken && this.now() < this.expiresAt;
    },

    getLocalPort: function() {
        return urlLib.getPort(env.client.url);
    },

    displayStart: function(req, res) {
        var redirectUrl = env.client.url + '/auth-confirm';
        var approveUrl  = this.apiBaseUrl + '/authorization'
            + '?response_type=code'
            + '&client_id=' + env.client.id
            + '&redirect_uri=' + redirectUrl
        ;

        res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
        res.write('<h1>Envato Auto-Uploader</h1>');
        res.write('<a href="' + approveUrl + '">'
            + 'Approve API access for the auto-downloader.</a>');
        res.end("\n");
    },

    postAccessTokenRequest: function(req, res, requestToken) {
        console.log('👉  Posting request for access token');
        var onReceiveAccessToken = this.onReceiveAccessToken;

        var onPostResponse = function(error, res, body) {
            if (!error && res.statusCode == 200) {
                onReceiveAccessToken(body);
                //res.writeHead(302, {'Location': '/'});
                res.end();
            } else {
                console.log('ERROR ' + res.statusCode);
                console.log(body);
                process.exit();
            }
        }

        var requestUrl = this.apiBaseUrl + '/token';
        var postData = {
            'grant_type': 'authorization_code',
            'code': requestToken,
            'client_id': env.client.id,
            'client_secret': env.client.secret
        };
//console.log(postData);
//process.exit();

        request.post(
            {url: requestUrl, form: postData},
            onPostResponse
        );
    },

    /**
     * Receive the response to the authentication request.
     * @param String body The json response object
     * @return Void
     */
    onReceiveAccessToken: function(res, body) {
        module.exports.setTokens(body);
        var msg = 'User has access? ' + module.exports.hasAccess();

        res.write(msg);
        console.log(msg);
    },

    receiveUserPermissionApproval: function(req, res) {
        var queryData       = urlLib.getQueryParams(req.url);
        var requestToken    = queryData.code;
        this.postAccessTokenRequest(req, res, requestToken);

        //res.end();
    }
};
