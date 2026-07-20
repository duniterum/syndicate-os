// The build bundles .ttf files as raw bytes (build.mjs `loader: { ".ttf":
// "binary" }` — esbuild's binary loader exports a Uint8Array default).
declare module "*.ttf" {
  const data: Uint8Array;
  export default data;
}
