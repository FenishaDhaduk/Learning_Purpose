export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
  
    if (!response.ok) {
      // Handle unauthorized requests or other errors
      throw new Error('Failed to fetch');
    }
  
    return response.json();
  };
  