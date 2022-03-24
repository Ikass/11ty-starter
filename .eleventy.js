const htmlmin = require('html-minifier');
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const metagen = require('eleventy-plugin-metagen');

// Generate responsive images
// borrowed from here: https://github.com/brycewray/eleventy_solo_starter_njk
const Image = require("@11ty/eleventy-img");
const path = require('path');

const widths = [300, 700, 1400];
const formats = ['webp', 'jpeg'];
const sizes = '100vw';

const isUrl = (str) => {
  try {
    return ['http:', 'https:'].includes(new URL(str).protocol)
  } catch {
    return false
  }
}

  const imageShortcode = async ( src, alt ) => {

    if (alt === undefined) throw new Error(`Missing 'alt' on responsive image from: ${src}`)

    const srcPath = isUrl(src) ? src : path.join('./src/assets/img/', src)
    const imgDir = isUrl(src) ? '' : path.parse(src).dir

    const metadata = await Image(srcPath, {
      widths,
      formats,
      outputDir: path.join('_site/assets/img', imgDir),
      urlPath: '/assets/img' + imgDir,
    })

    const markup = Image.generateHTML(metadata, {
      alt,
      sizes,
      loading: 'lazy',
      decoding: 'async',
      class: 'object-cover',
    })

    return `<figure>${markup}<figcaption>${alt}</figcaption></figure>`
  }

const now = String(Date.now());

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./styles/tailwind.config.js');
  eleventyConfig.addWatchTarget('./styles/tailwind.css');
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(metagen);
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({
    './node_modules/alpinejs/dist/cdn.js': './assets/js/alpine.js',
  })

  eleventyConfig.addShortcode('version', function () {
    return now
  });

  // add Image shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  //  Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith('.html')
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      })
      return minified
    }
    return content
  })

  return {
    dir: {
      // These values are relative to your input directory.
      input: "src",
    },
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "md", "njk", "yml"]
  }
}