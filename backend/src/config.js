require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV,
  DB_PATH: process.env.DB_PATH
    ? require('path').resolve(process.env.DB_PATH)
    : require('path').join(__dirname, '../database/budget_planner.db'),
  CORS_ORIGIN: NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || '*')
    : (process.env.CORS_ORIGIN || 'http://localhost:5173'),
  DEFAULT_BUDGET: parseFloat(process.env.DEFAULT_BUDGET) || 5000,
  MAX_BUDGET: parseFloat(process.env.MAX_BUDGET) || 50000,
  SIMULATION_MODE: process.env.SIMULATION_MODE !== 'false',
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_IOT_ENDPOINT: process.env.AWS_IOT_ENDPOINT || '',
  SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || '',
};
