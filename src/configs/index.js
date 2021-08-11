require("mandatoryenv").load();

const configs = (() => {

    const port = process.env.PORT || 5000;
    const origin1 = process.env.SPA_ORIGIN1;
    const origin2 = process.env.SPA_ORIGIN2;
    const token = process.env.SPA_TOKEN;
    const connection = process.env.SPA_CONNECT;

    const listOriginAccept = [origin1, origin2];

    return {
        port,
        listOriginAccept,
        token,
        connection,
    }
})();

module.exports = configs;
