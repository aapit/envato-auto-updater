module.exports = {
    client: {
        id: null,
        url: null,
        secret: null
    },

    init: function() {
        this.verifyPresence();
        this.load();
    },

    warn: function() {
        var errorEnvMissing = "Missing one of the environment variables:\n"
            + "ENVATO_CLIENT_ID (for instance 'fast-wp-auto-updater-2lk1d0920')\n"
            + "ENVATO_CLIENT_URL (for instance 'http://localhost.example.com:8888')\n"
            + "ENVATO_CLIENT_SECRET (for instance '3lkj2f2va2sd98Wmei1d9g38')\n"
        ;
        throw new Error(errorEnvMissing);
    },

    verifyPresence: function() {
        if (
            process.env.ENVATO_CLIENT_ID === undefined ||
            process.env.ENVATO_CLIENT_URL === undefined ||
            process.env.ENVATO_CLIENT_SECRET === undefined
        ) {
            this.warn();
        }
    },

    load: function() {
        this.client.id      = process.env.ENVATO_CLIENT_ID;
        this.client.url     = process.env.ENVATO_CLIENT_URL;
        this.client.secret  = process.env.ENVATO_CLIENT_SECRET;
    }
};

module.exports.init();
