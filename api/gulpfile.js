const gulp = require("gulp");
const babel = require("gulp-babel");
const del = require("del");
const rsync = require("gulp-rsync");
const nodeExec = require("child_process").exec;

require("dotenv");

const exec = cmd =>
  new Promise((resolve, reject) => {
    const output = [];
    const childProcess = nodeExec(cmd);
    console.log(chalk.blue(cmd));
    childProcess.addListener("error", reject);
    childProcess.addListener("exit", code => {
      if (code === 0) {
        console.log("");
        resolve(output.join(""));
      } else {
        console.log(`${chalk.red("!  ")}${chalk.bgRed.white(` Command exited with ${code} `)}\n`);
        reject(code);
      }
    });
    childProcess.stdout.on("data", data => {
      output.push(data.trim());
      console.log(chalk.dim(`>   ${data.trim()}`));
    });
    childProcess.stderr.on("data", data => {
      console.log(chalk.red(`>   ${data.trim()}`));
    });
  });

gulp.task("clean", () => del("dist"));

gulp.task("build", ["clean"], () => {
  return gulp
    .src(["src/**/*.js", "!src/**/__tests__/**/*.js"])
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task("push-files", ["build"], () => {
  gulp
    .src(["dist/**/*.js", "package.json", "yarn.lock", "ecosystem.json", ".env-prod"], {
      base: ".",
    })
    .pipe(
      rsync({
        hostname: process.env.HOSTNAME,
        username: process.env.USERNAME,
        destination: "api",
        compress: true,
        shell: `ssh -i ${process.env.PEM_FILE}`,
      })
    );
});

gulp.task("deploy", ["push-files"], cb =>
  exec(
    `ssh -i ${process.env.PEM_FILE} ${process.env.USERNAME}@${process.env
      .HOSTNAME} 'cd api && yarn install --production && mv .env-prod .env && pm2 startOrRestart ecosystem.json --env production'`
  )
);
