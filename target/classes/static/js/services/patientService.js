// =============================================
// patientService.js - Patient Fetch & Filter Operations
// =============================================

const PatientService = {

    // Fetch all patients
    async getAll() {
        const response = await fetch(`${API_BASE}/patients`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch patients');
        return response.json();
    },

    // Fetch a single patient by ID
    async getById(id) {
        const response = await fetch(`${API_BASE}/patients/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Patient not found');
        return response.json();
    },

    // Get prescriptions for a specific patient
    async getPrescriptions(patientName) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/prescriptions/${token}?patientName=${encodeURIComponent(patientName)}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch prescriptions');
        return response.json();
    },

    // Get prescriptions by appointment ID
    async getPrescriptionsByAppointment(appointmentId) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/prescriptions/${token}?appointmentId=${appointmentId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch prescriptions');
        return response.json();
    },

    // Create a new prescription (doctor only)
    async createPrescription(prescriptionData) {
        const token = getToken();
        const response = await fetch(`${API_BASE}/prescriptions/${token}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(prescriptionData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to create prescription');
        }
        return response.json();
    },

    // Client-side search by name
    filterByName(patients, name) {
        if (!name) return patients;
        return patients.filter(p =>
            p.name.toLowerCase().includes(name.toLowerCase())
        );
    }
};
