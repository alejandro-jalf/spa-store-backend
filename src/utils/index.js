const {
    connectionZaragoza,
    connectionVictoria,
    connectionOluta,
    connectionJaltipan,
    connectionBodega,
} = require('../configs');

const utils = (() => {
    const createContentAssert = (message, data = null) => (data === null) ?
        { success: true, message } :
        { success: true, message, data}

    const createContentError = (message, error = null) => (error === null) ?
        { success: false, message } :
        { success: false, message, error }

    const createResponse = (status, response) => ({ status, response })

    const getConnectionFrom = (from = '') => {
        if (from.trim() === '')
            return null;
        if (from.trim().toLowerCase() === 'zr') return connectionZaragoza;
        if (from.trim().toLowerCase() === 'vc') return connectionVictoria;
        if (from.trim().toLowerCase() === 'ou') return connectionOluta;
        if (from.trim().toLowerCase() === 'jl') return connectionJaltipan;
        if (from.trim().toLowerCase() === 'bo') return connectionBodega;
    }

    return {
        createContentAssert,
        createContentError,
        createResponse,
        getConnectionFrom,
    }
})();

module.exports = utils;
