"use strict";

const gulp = require("gulp"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  htmlmin = require("gulp-htmlmin"),
  rename = require("gulp-rename"),
  cssnano = require("gulp-cssnano"),
  plumber = require("gulp-plumber"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  del = require("del"),
  stylelint = require("gulp-stylelint"),
  babel = require("gulp-babel"),
  sequence = require("run-sequence"),
  // svgstore = require("gulp-svgstore"),
  imagemin = require("gulp-imagemin");

gulp.task("html", () =>
  gulp
    .src("./src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }).pipe(gulp.dest("./build")))
);

gulp.task("styles", () =>
  gulp
    .src("./src/sass/**/*.scss")
    .pipe(plumber())
    .pipe(
      stylelint({
        reporters: [{ formatter: "string", console: true }]
      })
    )
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest("./build/css"))
    .pipe(cssnano())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./build/css"))
    .pipe(browserSync.stream())
);

// gulp.task("svg-sprite", () =>
//   gulp
//     .src("./src/img/sprite/**/*.svg")
//     .pipe(
//       svgstore({
//         inlineSvg: true
//       })
//     )
//     .pipe(rename("sprite.svg"))
//     .pipe(gulp.dest("./build/img"))
// );

gulp.task("images", () =>
  gulp
    .src("./src/img/**/*.{png,jpg,jpeg,svg}")
    .pipe(
      imagemin([
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(gulp.dest("./build/img"))
);

gulp.task("scripts", () =>
  gulp
    .src(["./node_modules/babel-polyfill/dist/polyfill.min.js", "./src/js/index.js"]) //src("./src/js/*.js")
    .pipe(plumber())
    .pipe(
      babel({
        presets: ["env"]
      })
    )
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest("./build/js"))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./build/js"))
);

gulp.task("fonts", () =>
  gulp.src("./src/fonts/**/*.{woff,woff2,ttf}").pipe(gulp.dest("./build/fonts"))
);

gulp.task("watch", () => {
  gulp.watch("./src/*.html", ["html"]).on("change", browserSync.reload);
  gulp.watch("./src/sass/*.scss", ["styles"]);
  gulp.watch("./src/js/*.js", ["scripts"]).on("change", browserSync.reload);
});

gulp.task("serve", () =>
  browserSync.init({
    server: "./build",
    notify: false,
    cors: true,
    ui: false
  })
);

gulp.task("del:build", () => del("./build"));

gulp.task("build", () =>
  sequence(
    "del:build",
    "html",
    "images",
    "fonts",
    "styles",
    "scripts"
  )
);

gulp.task("build-dev", () =>
  sequence("html", "fonts", "styles", "scripts")
);

gulp.task("start", () => sequence("build", "serve", "watch"));

gulp.task("start-dev", () => sequence("build-dev", "serve", "watch"));
