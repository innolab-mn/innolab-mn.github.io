/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",
  experimental: { globalNotFound: true },
  images: {
    loader: "default",
    unoptimized: true,
  },
};
