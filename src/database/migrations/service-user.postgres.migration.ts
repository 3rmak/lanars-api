module.exports = {
  up: async (queryInterface) => {
    const sequelize = queryInterface.sequelize;

    await sequelize.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'lanars') THEN
              CREATE DATABASE lanars;
          END IF;
      END $$;
    `);
    await sequelize.query('GRANT ALL PRIVILEGES ON DATABASE "lanars" TO postgres;');
  },

  down: async (queryInterface) => {
    const sequelize = queryInterface.sequelize;
    await sequelize.query('DROP USER IF EXISTS postgres;');
  },
};
