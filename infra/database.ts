// Demo budget: VPC without NAT (~$0) + RDS db.t4g.micro (~$14/mo in us-east-1).
// Lambda reaches RDS over the private VPC; no NAT until SES/outbound is needed.

const dbPassword = new sst.Secret("PostgresPassword", "sezcuin-demo-pass");

export const vpc = new sst.aws.Vpc("Vpc");

export const postgres = new sst.aws.Postgres("Database", {
  vpc,
  database: "sezcuin",
  instance: "t4g.micro",
  storage: "20 GB",
  password: dbPassword.value,
  transform: {
    instance: {
      backupRetentionPeriod: 1,
      performanceInsightsEnabled: false,
    },
  },
  dev: {
    username: "postgres",
    password: "postgres",
    database: "sezcuin",
    host: "localhost",
    port: 5432,
  },
});
