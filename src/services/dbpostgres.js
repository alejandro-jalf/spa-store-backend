const Sequelize = require("sequelize");

const conexionPostgres = (() => {
    let conection = null;
    // let dbpostgresql = null;
    
    // const setConfig = (dbpostgresqlR = null) => {
    //     dbpostgresql = dbpostgresqlR;
    // }

    const dbpostgresql = (cadenaConexion) => {
        return new Sequelize(cadenaConexion, {
            dialect: "postgres",
            protocol: "postgres",
            pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
            dialectOptions: {
                native: true,
                ssl: {
                    rejectUnauthorized: false
                },
                options: {
                    useUTC: false,
                    dateFirst: 1,
                    enableArithAbort: true,
                    trustServerCertificate: true,
                },
            },
            define: { timestamps: false },
        });
    }
    
    const getConexion = (stringConection = '') => {
        if (stringConection === '') return null;
        conection = dbpostgresql(stringConection);
        return conection;
    }

    const closeConexion = () => {
        if (conection !== null) {
            conection.close();
            conection = null;
        }
    }

    return {
        // setConfig,
        getConexion,
        closeConexion,
    }
})();

module.exports = conexionPostgres;