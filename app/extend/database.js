module.exports = (app) => {
  if (!app.config.db) {
    return;
  } else {
    return require("knex")(app.config.db);
  }
};
