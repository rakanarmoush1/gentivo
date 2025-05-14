export const getSalonId = () => {
  const host = window.location.hostname;
  if (host.includes("gentivo.ai") && host.split(".").length > 2) {
    return host.split(".")[0];
  }
  // For local development testing
  const urlParams = new URLSearchParams(window.location.search);
  const salonParam = urlParams.get('salon');
  if (salonParam) {
    return salonParam;
  }
  return null;
}; 