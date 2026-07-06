import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Render / production PostgreSQL — connection string takes precedence
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  });
} else if (process.env.DB_DIALECT === 'postgres' || process.env.DB_DIALECT === 'mysql') {
  // Explicit postgres/mysql via individual env vars (non-Render)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'daniswara_event',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || (process.env.DB_DIALECT === 'postgres' ? '5432' : '3306')),
      dialect: process.env.DB_DIALECT,
      logging: process.env.NODE_ENV === 'production' ? false : console.log,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: {
        timestamps: true,
        paranoid: true,
        underscored: true,
      },
    }
  );
} else {
  // Default: SQLite for local development
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  });
}

export default sequelize;
