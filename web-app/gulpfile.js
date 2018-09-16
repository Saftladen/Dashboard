const gulp = require("gulp");
const awspublish = require("gulp-awspublish");
const awspublishRouter = require("gulp-awspublish-router");
const exec = require("@danielberndt/exec");
const parallelize = require("concurrent-transform");

const CONFIG = {build: "./build"};

function buildWithEnv(env) {
  return async function() {
    require("dotenv").config({path: env});
    await exec("yarn build");
  };
}

function deployWith(env) {
  return () => {
    if (env) require("dotenv").config({path: env});
    const publisher = awspublish.create({
      params: {Bucket: process.env.S3_BUCKET},
      region: process.env.S3_BUCKET_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    // we don't want the index.html to be cached. The other resources get
    // nicer cache values from cloudfront
    // TODO: that's actually wrong, CF doesn't add headers just like that..
    // const headers = {"Cache-Control": "max-age=0, no-transform, public"};
    return gulp
      .src([`${CONFIG.build}/**`])
      .pipe(
        awspublishRouter({
          cache: {
            // cache for 20 years by default
            cacheTime: 630720000,
          },
          routes: {
            "^.+\\.(html|json)": {
              // apply gzip with extra options
              cacheTime: 0,
            },
            "^.+$": "$&",
          },
        })
      )
      .pipe(awspublish.gzip())
      .pipe(parallelize(publisher.publish(), 10))
      .pipe(publisher.sync())
      .pipe(publisher.cache())
      .pipe(awspublish.reporter());
  };
}

gulp.task("build-prod", buildWithEnv(".env.deploy-prod"));
gulp.task("deploy-prod", deployWith(".env.deploy-prod"));
