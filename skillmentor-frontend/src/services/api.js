// API Client for SkillSwap Campus Backend REST APIs

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (r) => {
  const text = await r.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  if (!r.ok) {
    const errorMsg = (data && (data.message || data.error)) || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth & Profile
  register: (data) => fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
  login: (data) => fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
  getCurrentUser: () => fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  updateProfile: (data) => fetch(`${API_BASE_URL}/auth/profile`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  sendCollegeOtp: (email, collegeEmail) => fetch(`${API_BASE_URL}/auth/otp/send?email=${encodeURIComponent(email)}&collegeEmail=${encodeURIComponent(collegeEmail)}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  verifyCollegeOtp: (email, otpCode) => fetch(`${API_BASE_URL}/auth/otp/verify`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, otpCode }) }).then(handleResponse),
  addSkill: (skillData) => fetch(`${API_BASE_URL}/auth/skills`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(skillData) }).then(handleResponse),
  deleteSkill: (skillId) => fetch(`${API_BASE_URL}/auth/skills/${skillId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  deleteSkillByName: (skillName) => fetch(`${API_BASE_URL}/auth/skills/name/${encodeURIComponent(skillName)}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Verification
  submitVerification: (formData) => fetch(`${API_BASE_URL}/verifications/submit`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData }).then(handleResponse),

  // Discovery & Peer Matcher
  searchMentors: (skill = '', college = '') => fetch(`${API_BASE_URL}/discovery/mentors?skill=${encodeURIComponent(skill)}&college=${encodeURIComponent(college)}`, { headers: getHeaders() }).then(handleResponse),
  getPeerMatches: () => fetch(`${API_BASE_URL}/discovery/peer-matches`, { headers: getHeaders() }).then(handleResponse),

  // Bookings
  createBooking: (data) => fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateSessionStatus: (sessionId, status) => fetch(`${API_BASE_URL}/bookings/${sessionId}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  getMySessions: () => fetch(`${API_BASE_URL}/bookings`, { headers: getHeaders() }).then(handleResponse),
  getMentorSummary: () => fetch(`${API_BASE_URL}/bookings/mentor-summary`, { headers: getHeaders() }).then(handleResponse),

  // Wallet & Payments
  getWallet: () => fetch(`${API_BASE_URL}/wallet`, { headers: getHeaders() }).then(handleResponse),
  getWalletSummary: () => fetch(`${API_BASE_URL}/wallet/summary`, { headers: getHeaders() }).then(handleResponse),
  transferCredits: (recipientUserId, amount, reason) => fetch(`${API_BASE_URL}/wallet/transfer`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ recipientUserId, amount, reason }) }).then(handleResponse),
  createRazorpayOrder: (sessionId) => fetch(`${API_BASE_URL}/payments/razorpay/order`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ sessionId }) }).then(handleResponse),
  verifyRazorpayPayment: (data) => fetch(`${API_BASE_URL}/payments/razorpay/verify`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getPaymentHistory: () => fetch(`${API_BASE_URL}/payments/history`, { headers: getHeaders() }).then(handleResponse),

  // Reviews
  submitReview: (sessionId, rating, feedback) => fetch(`${API_BASE_URL}/reviews`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ sessionId, rating, feedback }) }).then(handleResponse),
  getMentorReviews: (mentorId) => fetch(`${API_BASE_URL}/reviews/mentor/${mentorId}`, { headers: getHeaders() }).then(handleResponse),

  // Chat
  getChatHistory: (sessionId) => fetch(`${API_BASE_URL}/chat/history/${sessionId}`, { headers: getHeaders() }).then(handleResponse),
  sendChatMessage: (data) => fetch(`${API_BASE_URL}/chat/send`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),

  // Admin APIs
  getAdminSummary: () => fetch(`${API_BASE_URL}/admin/summary`, { headers: getHeaders() }).then(handleResponse),
  getAdminUsers: () => fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() }).then(handleResponse),
  getAdminVerifications: () => fetch(`${API_BASE_URL}/admin/verifications`, { headers: getHeaders() }).then(handleResponse),
  getAdminPayments: () => fetch(`${API_BASE_URL}/admin/payments`, { headers: getHeaders() }).then(handleResponse),
  getPendingVerifications: () => fetch(`${API_BASE_URL}/verifications/pending`, { headers: getHeaders() }).then(handleResponse),
  processVerification: (id, approve, notes = '') => fetch(`${API_BASE_URL}/admin/verifications/${id}/process?approve=${approve}&notes=${encodeURIComponent(notes)}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  getReports: (status = '') => fetch(`${API_BASE_URL}/admin/reports${status ? `?status=${status}` : ''}`, { headers: getHeaders() }).then(handleResponse),
  resolveReport: (id, dismiss = false, notes = '') => fetch(`${API_BASE_URL}/admin/reports/${id}/resolve?dismiss=${dismiss}&notes=${encodeURIComponent(notes)}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  toggleUserSuspension: (userId, suspend, reason = '') => fetch(`${API_BASE_URL}/admin/users/${userId}/suspend?suspend=${suspend}&reason=${encodeURIComponent(reason)}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  getPlatformAnalytics: () => fetch(`${API_BASE_URL}/admin/analytics`, { headers: getHeaders() }).then(handleResponse),
  getAdminActionLogs: () => fetch(`${API_BASE_URL}/admin/logs`, { headers: getHeaders() }).then(handleResponse),
  // Peer Help Requests & Reciprocal Matches
  createPeerRequest: (data) => fetch(`${API_BASE_URL}/peer-requests`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getPeerRequests: (category = '', skill = '', status = 'OPEN', program = '', domain = '', query = '') => fetch(`${API_BASE_URL}/peer-requests?category=${encodeURIComponent(category)}&skill=${encodeURIComponent(skill)}&status=${encodeURIComponent(status)}&program=${encodeURIComponent(program)}&domain=${encodeURIComponent(domain)}&query=${encodeURIComponent(query)}`, { headers: getHeaders() }).then(handleResponse),
  getPeerRequestById: (id) => fetch(`${API_BASE_URL}/peer-requests/${id}`, { headers: getHeaders() }).then(handleResponse),
  applyToPeerRequest: (id, message) => fetch(`${API_BASE_URL}/peer-requests/${id}/apply`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ message }) }).then(handleResponse),
  getPeerRequestApplications: (id) => fetch(`${API_BASE_URL}/peer-requests/${id}/applications`, { headers: getHeaders() }).then(handleResponse),
  selectPeerApplicant: (requestId, applicationId) => fetch(`${API_BASE_URL}/peer-requests/${requestId}/select/${applicationId}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  completePeerRequest: (id) => fetch(`${API_BASE_URL}/peer-requests/${id}/complete`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  cancelPeerRequest: (id) => fetch(`${API_BASE_URL}/peer-requests/${id}/cancel`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  // Reciprocal Matches
  getSuggestedReciprocalMatches: () => fetch(`${API_BASE_URL}/reciprocal-matches/suggested`, { headers: getHeaders() }).then(handleResponse),
  acceptReciprocalMatch: (id) => fetch(`${API_BASE_URL}/reciprocal-matches/${id}/accept`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  declineReciprocalMatch: (id) => fetch(`${API_BASE_URL}/reciprocal-matches/${id}/decline`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
};
