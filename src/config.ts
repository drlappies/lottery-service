export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV,
  appEnv: process.env.APP_ENV || 'local',
  postgres: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    username: process.env.POSTGRES_USERNAME || 'developer',
    password:
      process.env.POSTGRES_PASSWORD || 'oozohnoaQu0quohZ5shahmo3Jei7naeW',
    database: process.env.POSTGRES_DB || 'lottery',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.PORT || 6379,
  },
  lottery: {
    life: 60 * 1000,
  },
  ticket: {
    secret: process.env.TICKET_SECRET || 'Oonieph4oogu4aibeigh8goo5voiphu8',
  },
});
