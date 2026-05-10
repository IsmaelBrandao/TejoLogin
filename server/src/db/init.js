require("dotenv").config();

const { ensureSchema, pool } = require("./pool");

ensureSchema()
  .then(() => {
    console.log("Banco pronto para uso.");
  })
  .catch((error) => {
    console.error("Falha ao preparar o banco:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
