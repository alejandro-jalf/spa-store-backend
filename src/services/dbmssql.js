const Sequelize = require("sequelize");

const conexion = (() => {
  let conection = null;

  const dbpostgresql = (cadenaConexion = '') => {
    return new Sequelize(cadenaConexion, {
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: {
        options: {
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
  
  const getConexion = (stringConection = '') => {
      if (stringConection === '') return null;
      if (conection === null) {
          conection = dbpostgresql(stringConection);
      }
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

