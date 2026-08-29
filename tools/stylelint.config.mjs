// The theme's stylesheets. stylelint refuses to start without a config,
// so this ships whether or not a theme adds a stylesheet of its own.
//
// chroma.css is generated from a named Chroma style, so it is read for
// contrast by the accessibility gate and not for house style here.
//
// Two rules are pointed away from their defaults rather than switched
// off, because their defaults narrow which browsers the theme works in.
// A theme is downloaded and run by other people; a linter's idea of
// modern is not a reason to drop them. Both still fire on anything
// else, which is the point of aiming them rather than disabling them.
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "no-descending-specificity": null,

    // Safari implements -webkit-text-size-adjust and not the unprefixed
    // property. The rule assumes an autoprefixer step, and there is
    // none here, so unprefixing it means the declaration does nothing
    // on Safari. Every other needless prefix is still reported.
    //
    // Written as a regex. ignoreProperties is documented as taking the
    // unprefixed name, and on stylelint 17.14.1 the plain string does
    // not match; the regex form does.
    "property-no-vendor-prefix": [true, { ignoreProperties: ["/text-size-adjust/"] }],

    // Range notation ((width <= 60rem)) needs Safari 16.4, Firefox 102
    // and Chrome 104. Older browsers do not parse the block at all, so
    // the whole narrow layout would silently stop applying. Asking for
    // the prefix form keeps the rule enforcing one spelling; it just
    // enforces the spelling that works.
    "media-feature-range-notation": "prefix",
  },
};
