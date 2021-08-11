const app = require("./app");

const { port } = require("./configs");

app.listen(port, () => console.info("Servidor ejecutandose en el puerto ", port));