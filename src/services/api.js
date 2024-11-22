export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token'); 
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`, 
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
  
    return response.json();
  };
  