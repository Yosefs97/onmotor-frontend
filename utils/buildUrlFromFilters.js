// /utils/buildUrlFromFilters.js
export function buildUrlFromFilters(filters = {}, pathname = "/shop", product = null) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  const vendor = (filters.vendor || "").trim();
  const model = (filters.model || "").trim();

  let basePath = "/shop";
  if (vendor && model) {
    basePath = `/shop/vendor/${encodeURIComponent(vendor)}/${encodeURIComponent(model)}`;
  } else if (vendor) {
    basePath = `/shop/vendor/${encodeURIComponent(vendor)}`;
  } else if (product) {
    basePath = "/shop";
  } else {
    basePath = pathname;
  }

  return params.toString() ? `${basePath}?${params.toString()}` : basePath;
}
