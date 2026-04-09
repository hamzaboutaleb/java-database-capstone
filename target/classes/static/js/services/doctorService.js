// =============================================
// doctorService.js - Doctor CRUD & Search Operations
// =============================================

const DoctorService = {

    // Fetch all doctors
    async getAll() {
        const response = await fetch(`${API_BASE}/doctors`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch doctors');
        return response.json();
    },

    // Fetch a single doctor by ID
    async getById(id) {
        const response = await fetch(`${API_BASE}/doctors/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Doctor not found');
        return response.json();
    },

    // Search doctors by name
    async searchByName(name) {
        const response = await fetch(`${API_BASE}/doctors/search?name=${encodeURIComponent(name)}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Search failed');
        return response.json();
    },

    // Filter doctors by specialty
    async filterBySpecialty(specialty) {
        const response = await fetch(`${API_BASE}/doctors/filter?specialty=${encodeURIComponent(specialty)}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Filter failed');
        return response.json();
    },

    // Filter doctors by available time
    async filterByTime(time) {
        const response = await fetch(`${API_BASE}/doctors/filter?time=${encodeURIComponent(time)}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Filter failed');
        return response.json();
    },

    // Add a new doctor
    async create(doctorData) {
        const response = await fetch(`${API_BASE}/doctors`, {
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

    // Delete a doctor by ID
    async delete(id) {
        const response = await fetch(`${API_BASE}/doctors/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete doctor');
        return true;
    },

    // Get doctor's appointments
    async getAppointments(doctorId, date) {
        let url = `${API_BASE}/doctors/${doctorId}/appointments`;
        if (date) url += `?date=${date}`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch appointments');
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
