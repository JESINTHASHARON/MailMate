/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:1895593928,
    NEXT_PUBLIC_ZEGO_SERVER_SECRET: "b3ce5f03865633231ecd40f51bca553f",
  },
  //domain is mentioned to add the images from another source
  images:{
    domains:["localhost"],
  },
};

module.exports = nextConfig;
