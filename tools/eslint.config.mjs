// The theme's scripts. ESLint 10 refuses to start without a config, so
// this ships whether or not a theme has any script of its own.
export default [
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        getComputedStyle: "readonly",
        console: "readonly",

        // Read from the URL by search.js and tags.js: a query can be
        // sent to someone, and narrowing by tag is a real navigation
        // rather than a state the page keeps to itself. Named here so
        // no-undef still means something — a mistyped global is an
        // error, and these are not mistyped.
        URLSearchParams: "readonly",
        location: "readonly",
        history: "readonly",

        // theme.js remembers the reader's choice of light or dark. Named
        // for the same reason as the rest: a typo here should still be
        // an error.
        localStorage: "readonly",

        // toc-rail.js follows the reading down the page.
        requestAnimationFrame: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
    },
  },
];
