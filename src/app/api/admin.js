import { apiRequest, parseCollection } from './client';
import { API_PATHS } from './paths';
import { normalizeTicket } from './tickets';

export const normalizeAdminUser = raw => {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }
  return {
    ...raw,
    id: raw.id,
    isActive: raw.isActive ?? true,
  };
};

export async function fetchAdminDashboard(token) {
  return apiRequest(API_PATHS.adminDashboard, { token });
}

export async function fetchAdminUsers(token) {
  const data = await apiRequest(API_PATHS.adminUsers, { token });
  return parseCollection(data).map(normalizeAdminUser);
}

export async function createAdminUser(token, payload) {
  const data = await apiRequest(API_PATHS.adminUsers, {
    token,
    method: 'POST',
    body: payload,
  });
  return normalizeAdminUser(data);
}

export async function updateAdminUser(token, id, payload) {
  const data = await apiRequest(`${API_PATHS.adminUsers}/${id}`, {
    token,
    method: 'PUT',
    body: payload,
  });
  return normalizeAdminUser(data);
}

export async function deleteAdminUser(token, id) {
  return apiRequest(`${API_PATHS.adminUsers}/${id}`, {
    token,
    method: 'DELETE',
  });
}

export async function toggleAdminUserStatus(token, id) {
  const data = await apiRequest(`${API_PATHS.adminUsers}/${id}/toggle-status`, {
    token,
    method: 'POST',
  });
  return normalizeAdminUser(data);
}

export async function resetAdminUserPassword(token, id) {
  return apiRequest(`${API_PATHS.adminUsers}/${id}/reset-password`, {
    token,
    method: 'POST',
  });
}

export async function fetchAdminTickets(token) {
  const data = await apiRequest(API_PATHS.adminTickets, { token });
  return parseCollection(data).map(normalizeTicket);
}

export async function fetchAdminTicket(token, id) {
  const data = await apiRequest(`${API_PATHS.adminTickets}/${id}`, { token });
  return normalizeTicket(data);
}

export async function createAdminTicket(token, payload) {
  const data = await apiRequest(API_PATHS.adminTickets, {
    token,
    method: 'POST',
    body: payload,
  });
  return normalizeTicket(data);
}

export async function deleteAdminTicket(token, id) {
  return apiRequest(`${API_PATHS.adminTickets}/${id}`, {
    token,
    method: 'DELETE',
  });
}

export async function fetchAdminActivityLogs(token, filters = {}) {
  const params = new URLSearchParams();
  if (filters.userId) {
    params.set('user', String(filters.userId));
  }
  if (filters.action) {
    params.set('action', filters.action);
  }
  if (filters.startDate) {
    params.set('start_date', filters.startDate);
  }
  if (filters.endDate) {
    params.set('end_date', filters.endDate);
  }
  const qs = params.toString();
  const path = qs
    ? `${API_PATHS.adminActivityLogs}?${qs}`
    : API_PATHS.adminActivityLogs;
  const data = await apiRequest(path, { token });
  const logs = Array.isArray(data?.logs)
    ? data.logs
    : parseCollection(data?.logs ?? data);
  return {
    logs,
    availableActions: data?.availableActions || [
      'LOGIN',
      'LOGOUT',
      'CREATE',
      'UPDATE',
      'DELETE',
    ],
  };
}
