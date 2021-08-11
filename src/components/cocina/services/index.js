const { createContentAssert, createResponse } = require('../../../utils')

const ServicesCocina = (() => {

    const mainRoute = () => {
        const response = createContentAssert("Ruta principal de cocina");
        return createResponse(200, response);
    }

    return {
        mainRoute
    }
})();

module.exports = ServicesCocina;