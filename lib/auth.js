// Authentication utility functions for API calls

/**
 * Check if user is authenticated
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function checkAuth() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, user: data.user };
    } else {
      const data = await response.json();
      return { success: false, error: data.error || "Not authenticated" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

/**
 * Login user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function login(username, password) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || "Login failed" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

/**
 * Register new user
 * @param {string} name
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function register(name, username, password) {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: name.trim(),
        username: username.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || "Registration failed" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

/**
 * Logout user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.error || "Logout failed" };
    }
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

