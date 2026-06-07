const originalFetch = window.fetch;

window.fetch = async function (url, options = {}) {
  let response;
  try {
    response = await originalFetch(url, options);
  } catch (err) {
    throw err;
  }

  // Intercept 401 Unauthorized responses (skip refresh or login endpoints to prevent loop)
  const isAuthRefresh = typeof url === 'string' && (url.includes('/auth/refresh') || url.includes('/auth/login'));
  
  if (response.status === 401 && !isAuthRefresh) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
        
        // Attempt token refresh
        const refreshResponse = await originalFetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Update headers with new token
          if (options.headers) {
            if (options.headers instanceof Headers) {
              options.headers.set('Authorization', `Bearer ${data.token}`);
            } else if (Array.isArray(options.headers)) {
              const authIdx = options.headers.findIndex(h => h[0].toLowerCase() === 'authorization');
              if (authIdx !== -1) {
                options.headers[authIdx] = ['Authorization', `Bearer ${data.token}`];
              } else {
                options.headers.push(['Authorization', `Bearer ${data.token}`]);
              }
            } else {
              options.headers['Authorization'] = `Bearer ${data.token}`;
            }
          } else {
            options.headers = { 'Authorization': `Bearer ${data.token}` };
          }

          // Retry the request
          response = await originalFetch(url, options);
        } else {
          // If refresh token has expired or is invalid, wipe storage and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (refreshErr) {
        console.error('Error during auto token refresh:', refreshErr);
      }
    }
  }

  return response;
};
