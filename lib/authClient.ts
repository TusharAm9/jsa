/**
 * Client-side authentication utilities
 */

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Check if user is authenticated by trying to fetch protected endpoint
 */
export async function getAuthUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching auth user:', error);
    return null;
  }
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Login failed' };
    }

    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    return { success: false, message: 'An error occurred during login' };
  }
}

/**
 * Signup user
 */
export async function signupUser(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Signup failed' };
    }

    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    return { success: false, message: 'An error occurred during signup' };
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
