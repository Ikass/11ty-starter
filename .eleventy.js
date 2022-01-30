const htmlmin = require('html-minifier');
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

// Generate responsive images
// borrowed from here: https://github.com/brycewray/eleventy_solo_starter_njk
const Image = require("@11ty/eleventy-img");
const path = require('path');

const widths = [300, 700, 1400]
const formats = ['webp', 'jpeg']
const sizes = '100vw'

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
    })

    return `<figure>${markup}<figcaption>${alt}</figcaption></figure>`
  }

// async function imageShortcode(src, alt) {
//   let sizes = "(min-width: 1024px) 100vw, 50vw"
//   let srcPrefix = `./src/assets/img/`
//   src = srcPrefix + src
//   console.log(`Generating image(s) from:  ${src}`)
//   if(alt === undefined) {
//     // Throw an error on missing alt (alt="" works okay)
//     throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`)
//   }
//   let metadata = await Image(src, {
//     widths: [300, 700, 1400],
//     formats: ['webp', 'jpeg'],
//     urlPath: "/assets/img/",
//     outputDir: "./_site/assets/img/",
//     /* =====
//     Now we'll make sure each resulting file's name will
//     make sense to you. **This** is why you need
//     that `path` statement mentioned earlier.
//     ===== */
//     filenameFormat: function (id, src, width, format, options) {
//       const extension = path.extname(src)
//       const name = path.basename(src, extension)
//       return `${name}-${width}w.${format}`
//     }
//   })
//   let lowsrc = metadata.jpeg[0]
//   let highsrc = metadata.jpeg[metadata.jpeg.length - 1]
//   return `<picture>
//     ${Object.values(metadata).map(imageFormat => {
//       return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`
//     }).join("\n")}
//     <img
//     src="${lowsrc.url}"
//     width="${highsrc.width}"
//     height="${highsrc.height}"
//     alt="${alt}"
//     class="rounded-lg shadow-xl"
//     loading="lazy"
//     decoding="async">
//   </picture>`
// }

const now = String(Date.now())

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./styles/tailwind.config.js');
  eleventyConfig.addWatchTarget('./styles/tailwind.css');
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPassthroughCopy("src/assets/img");
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