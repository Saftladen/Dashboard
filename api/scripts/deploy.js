const {resolve, join} = require("path");
const exec = require("@danielberndt/exec");
const {promisify} = require("util");
const fs = require("fs");

require("dotenv").config();

const opts = `-cazP -e "ssh -o StrictHostKeyChecking=no"`;

getEnvVar = key => {
  const {DEPLOY_ENV_PREFIX} = process.env;
  if (!DEPLOY_ENV_PREFIX) throw new Error("no DEPLOY_ENV_PREFIX is set");
  return process.env[`${DEPLOY_ENV_PREFIX}_${key}`];
};

const deploy = async env => {
  const dest = getEnvVar("DEPLOY_TARGET");
  const targetDotEnv = getEnvVar("DEPLOY_DOTENV_FILE");

  const rootDir = resolve(join(__dirname, ".."));
  const distDir = resolve(rootDir, "dist");
  await exec(`rsync ${opts} --delete ${distDir} ${dest}:~/api`);
  await exec(
    `rsync ${opts} ${rootDir}/package.json ${rootDir}/yarn.lock ${rootDir}/ecosystem.json ${dest}:~/api`
  );
  await exec(`rsync ${opts} ${targetDotEnv} ${dest}:~/api/.env`);
  await exec(
    `ssh ${dest} 'cd api && yarn install --prod && pm2 restart ecosystem.json && pm2 save'`
  );
};

deploy(process.env.DEPLOY_ENV).catch(e => {
  throw e;
});
