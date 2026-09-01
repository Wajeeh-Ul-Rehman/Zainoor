// If the browser is on localhost, use port 5001. 
// Otherwise, use your live cPanel API subdomain.
export const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001' 
  : 'https://api.zainoor.com.pk';