if (!process.env.PORT) require("mandatoryenv").load();

const configs = (() => {

    const port = process.env.PORT || 5000;
    const origin1 = process.env.SPA_ORIGIN1;
    const origin2 = process.env.SPA_ORIGIN2;
    const token = process.env.SPA_TOKEN;
    const connectionMongoDB = process.env.SPA_CONNECT;
    const connectionPostgres = process.env.SPA_CONNECT_POSTGRES;
    const connectionZaragoza = process.env.SPA_ZR_SEQUELIZE;
    const connectionVictoria = process.env.SPA_VC_SEQUELIZE;
    const connectionOluta = process.env.SPA_OU_SEQUELIZE;
    const connectionJaltipan = process.env.SPA_JL_SEQUELIZE;
    const connectionBodega = process.env.SPA_BO_SEQUELIZE;
    const connectionEnriquez = process.env.SPA_EN_SEQUELIZE;
    const connectionSayula = process.env.SPA_SY_SEQUELIZE;
    const connectionCaasaEnriquez = process.env.CAASA_EN_SEQUELIZE;
    const connectionCaasaSayula = process.env.CAASA_SA_SEQUELIZE;
    const connectionCaasaSayulaT = process.env.CAASA_ST_SEQUELIZE;
    const connectionCaasaSuper = process.env.CAASA_SU_SEQUELIZE;

    const listOriginAccept = [origin1, origin2];

    const dataBase = {
        ZR: process.env.SPA_DATABASE_ZR,
        VC: process.env.SPA_DATABASE_VC,
        OU: process.env.SPA_DATABASE_OU,
        JL: process.env.SPA_DATABASE_JL,
        BO: process.env.SPA_DATABASE_BO,
        SU: process.env.SPA_DATABASE_SU,
        ER: process.env.SPA_DATABASE_EN,
        SA: process.env.SPA_DATABASE_SY,
        SY: process.env.SPA_DATABASE_SY,
    }

    return {
        port,
        listOriginAccept,
        token,
        connectionMongoDB,
        connectionPostgres,
        connectionZaragoza,
        connectionVictoria,
        connectionOluta,
        connectionJaltipan,
        connectionBodega,
        connectionSayula,
        connectionEnriquez,
        dataBase,
        connectionCaasaEnriquez,
        connectionCaasaSayula,
        connectionCaasaSuper,
        connectionCaasaSayulaT,
    }
})();

module.exports = configs;
