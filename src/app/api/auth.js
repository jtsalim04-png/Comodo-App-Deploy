import { BASE_URL } from './config';
import { fetchWithNetworkHint } from './client';
import { API_PATHS } from './paths';

const parseJsonResponse = async response => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export async function registerUser({
  email,
  password,
  firstName,
  lastName,
}) {
  const response = await fetchWithNetworkHint(`${BASE_URL}${API_PATHS.register}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    }),
  });

  const data = await parseJsonResponse(response);

  if (response.ok) {
    return data;
  }

  const message =
    data?.message ||
    data?.detail ||
    `Registration failed (${response.status})`;
  const error = new Error(message);
  error.status = response.status;
  error.data = data;
  throw error;
}

export async function userLogin({ email, password }) {
  const response = await fetchWithNetworkHint(`${BASE_URL}${API_PATHS.login}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonResponse(response);

  if (response.ok) {
    return data;
  }

  const message =
    data?.message ||
    (typeof data?.errors === 'string' ? data.errors : null) ||
    data?.errors?.password ||
    data?.errors?.email ||
    data?.detail ||
    'Login failed';
  throw new Error(message);
}

export async function googleAuth({ idToken }) {
  const response = await fetchWithNetworkHint(
    `${BASE_URL}${API_PATHS.googleAuth}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    },
  );

  const data = await parseJsonResponse(response);

  if (response.ok) {
    return data;
  }

  const message =
    data?.message ||
    data?.detail ||
    `Google sign-in failed (${response.status})`;
  throw new Error(message);
}
