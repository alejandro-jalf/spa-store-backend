const Sequelize = require("sequelize");

const conexion = (() => {
  let conection = null;

  const dbmssql = (cadenaConexion = '', timeOut = 30000) => {
    return new Sequelize(cadenaConexion, {
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: {
        options: {
          requestTimeout: timeOut,
          useUTC: false,
          dateFirst: 1,
          enableArithAbort: true,
          trustServerCertificate: true,
          encrypt:false
        },
      },
      define: { timestamps: false },
    });
  };
  
  const getConexion = (stringConection = '', timeOut) => {
      if (stringConection === '') return null;
      conection = dbmssql(stringConection, timeOut);
      return conection;
  }

  const closeConexion = () => {
      if (conection !== null) {
          conection.close();
          conection = null;
      }
  }

  return {
      getConexion,
      closeConexion,
  }
})();

module.exports = conexion;

