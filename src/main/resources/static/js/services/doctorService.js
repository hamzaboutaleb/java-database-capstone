// =============================================
// doctorService.js - Doctor CRUD & Search Operations
// =============================================

function tokenParam(prefix) {
    const t = getToken();
    return t ? `${prefix}token=${t}` : '';
}

const DoctorService = {

    // Fetch all doctors
    async getAll() {
        const response = await fetch(`${API_BASE}/doctors?${tokenParam('')}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch doctors');
        return response.json();
    },

    // Fetch a single doctor by ID
    async getById(id) {
        const response = await fetch(`${API_BASE}/doctors/${id}?${tokenParam('')}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Doctor not found');
        return response.json();
    },

    // Search doctors by name
    async searchByName(name) {
        const response = await fetch(`${API_BASE}/doctors/search?name=${encodeURIComponent(name)}&${tokenParam('')}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Search failed');
        return response.json();
    },

    // Filter doctors by specialty and/or time
    async filterBySpecialty(specialty) {
        const response = await fetch(`${API_BASE}/doctors/filter?specialty=${encodeURIComponent(specialty)}&${tokenParam('')}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Filter failed');
        return response.json();
    },

    // Filter doctors by available time
    async filterByTime(time) {
        const response = await fetch(`${API_BASE}/doctors/filter?time=${encodeURIComponent(time)}&${tokenParam('')}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Filter failed');
        return response.json();
    },

    // Add a new doctor (admin only)
    async create(doctorData) {
        const response = await fetch(`${API_BASE}/doctors?${tokenParam('')}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(doctorData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to add doctor');
        }
        return response.json();
    },

    // Delete a doctor by ID (admin only)
    async delete(id) {
        const response = await fetch(`${API_BASE}/doctors/${id}?${tokenParam('')}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete doctor');
        return true;
    },

    // Get doctor's appointments
    async getAppointments(doctorId, date) {
        let url = `${API_BASE}/doctors/${doctorId}/appointments?${tokenParam('')}`;
        if (date) url += `&date=${date}`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch appointments');
        return response.json();
    },

    // Get doctor availability for a specific date
    async getAvailability(doctorId, date) {
        const role = getRole();
        const token = getToken();
        const response = await fetch(
            `${API_BASE}/doctors/${doctorId}/availability/${date}?user=${role}&token=${token}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch availability');
        return response.json();
    },

    // Get unique specialties for filter dropdown
    async getSpecialties() {
        const doctors = await this.getAll();
        const specialties = [...new Set(doctors.map(d => d.specialty))];
        return specialties.sort();
    },

    // Client-side filter helper
    filterDoctors(doctors, { name, specialty, time }) {
        return doctors.filter(doc => {
            const matchName = !name || doc.name.toLowerCase().includes(name.toLowerCase());
            const matchSpecialty = !specialty || doc.specialty === specialty;
            const matchTime = !time || (doc.availableTimes && doc.availableTimes.some(t => t.includes(time)));
            return matchName && matchSpecialty && matchTime;
        });
    }
};
