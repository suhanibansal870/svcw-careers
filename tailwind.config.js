/** Tailwind config for SVCW Careers in Wastewater Management.
 *  Rebuild CSS after editing HTML:  npx tailwindcss@3.4.16 -i src/input.css -o tailwind.css --minify
 */
module.exports = {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f6f2",                               // neutral: warm off-white background
        card: "#fcfbf8",                                 // same neutral, one step lighter for cards
        ink: "#1c2340",                                  // text: deep navy-slate (nod to SVCW navy)
        accent: { DEFAULT: "#377a29", dark: "#2f6b23" }  // the one accent: SVCW green, for CTAs
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],   // headings
        sans: ['"DM Sans"', "system-ui", "sans-serif"]      // body
      }
    }
  }
};
