require('dotenv').config();

const isNeon = (process.env.DATABASE_URL || "").includes("neon.tech");

module.exports = {
  "development": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": isNeon ? {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    } : {}
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
};