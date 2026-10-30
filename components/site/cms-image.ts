export function isUnoptimizedCmsImage(src: string) {
  return src.startsWith("/api/media/") || src.startsWith("https://");
}
