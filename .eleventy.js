const htmlmin = require('html-minifier');
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

const Image = require("@11ty/eleventy-img");
const path = require('path');

const ImageWidths = {
  ORIGINAL: null,
  PLACEHOLDER: 24,
};

// const imageShortcode = async (
//   relativeSrc,
//   alt,
//   className,
//   widths = [400, 800, 1280],
//   baseFormat = 'jpeg',
//   optimizedFormats = ['webp'],
//   sizes = '100vw'  
//   ) => {
//     const { dir: imgDir } = path.parse(relativeSrc);
//     const fullSrc = path.join('src', relativeSrc);
  
//     const imageMetadata = await Image(fullSrc, {
//       widths: [ImageWidths.ORIGINAL, ImageWidths.PLACEHOLDER, ...widths],
//       formats: [...optimizedFormats, baseFormat],
//       outputDir: path.join('_site/assets/', imgDir),
//       urlPath: imgDir,
//     });
//     return `<picture></picture>`;
//   };

async function imageShortcode(src, alt) {
  let sizes = "(min-width: 1024px) 100vw, 50vw"
  let srcPrefix = `./src/assets/img/`
  src = srcPrefix + src
  console.log(`Generating image(s) from:  ${src}`)
  if(alt === undefined) {
    // Throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`)
  }
  let metadata = await Image(src, {
    widths: [600, 900, 1500],
    formats: ['webp', 'jpeg'],
    urlPath: "/assets/img/",
    outputDir: "./_site/assets/img/",
    /* =====
    Now we'll make sure each resulting file's name will
    make sense to you. **This** is why you need
    that `path` statement mentioned earlier.
    ===== */
    filenameFormat: function (id, src, width, format, options) {
      const extension = path.extname(src)
      const name = path.basename(src, extension)
      return `${name}-${width}w.${format}`
    }
  })
  let lowsrc = metadata.jpeg[0]
  let highsrc = metadata.jpeg[metadata.jpeg.length - 1]
  return `<picture>
    ${Object.values(metadata).map(imageFormat => {
      return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`
    }).join("\n")}
    <img
      class="rounded-lg shadow-xl"
      src="${lowsrc.url}"
      width="${highsrc.width}"
      height="${highsrc.height}"
      alt="${alt}"
      loading="lazy"
      decoding="async">
  </picture>`
}




const now = String(Date.now())

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./styles/tailwind.config.js');
  eleventyConfig.addWatchTarget('./styles/tailwind.css');
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPassthroughCopy("src/assets/img");
  eleventyConfig.addPassthroughCopy({
    './node_modules/alpinejs/dist/cdn.js': './js/alpine.js',
  })

  eleventyConfig.addShortcode('version', function () {
    return now
  })

  // add Image shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode)
  // === Liquid needed if `markdownTemplateEngine` **isn't** changed from Eleventy default
  eleventyConfig.addJavaScriptFunction("image", imageShortcode)



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
      // ⚠️ These values are relative to your input directory.
      input: "src",
    }
  }
  return {
    markdownTemplateEngine: "njk"
  }
}