import { sequelize } from '../models/index.js';

async function migrate() {
  try {
    console.log('Starting database migration...');
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ force: false, alter: false });
    console.log('All models synchronized.');

    // List tables
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('Tables created:');
    tables.forEach((t) => console.log(`  - ${t}`));

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
