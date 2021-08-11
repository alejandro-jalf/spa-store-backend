require("mandatoryenv").load();

const configs = (() => {

    const port = process.env.PORT || 5000;
    const origin1 = process.env.SPA_ORIGIN1;
    const origin2 = process.env.SPA_ORIGIN2;
    const token = process.env.SPA_TOKEN;
    const connectionMongoDB = process.env.SPA_CONNECT;
    const connectionZaragoza = process.env.SPA_ZR_SEQUELIZE;
    const connectionVictoria = process.env.SPA_VC_SEQUELIZE;
    const connectionOluta = process.env.SPA_OU_SEQUELIZE;
    const connectionJaltipan = process.env.SPA_JL_SEQUELIZE;
    const connectionBodega = process.env.SPA_BO_SEQUELIZE;

    const listOriginAccept = [origin1, origin2];

    return {
        port,
        listOriginAccept,
        token,
        connectionMongoDB,
        connectionZaragoza,
        connectionVictoria,
        connectionOluta,
        connectionJaltipan,
        connectionBodega,
    }
})();

module.exports = configs;
