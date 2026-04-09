// =============================================
// patientDashboard.js - Patient Dashboard Logic
// =============================================

let allDoctorsForPatient = [];
let myAppointments = [];

async function initPatientDashboard() {
    renderHeader('patient');
    setupTabs();
    await loadDoctorsForPatient();
    await loadMyAppointments();
    setupPatientFilters();
}

// --- Tabs ---

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab)?.classList.add('active');
        });
    });
}

// --- Load Doctors ---

async function loadDoctorsForPatient() {
    try {
        allDoctorsForPatient = await DoctorService.getAll();
        renderDoctorsForPatient(allDoctorsForPatient);
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

function renderDoctorsForPatient(doctors) {
    const grid = document.getElementById('patientDoctorGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (doctors.length === 0) {
        grid.innerHTML = '<p class="no-results">No doctors found.</p>';
        return;
    }

    doctors.forEach(doctor => {
        const card = createDoctorCard(doctor, { showBook: false });
        grid.appendChild(card);
    });
}

// --- Load Appointments ---

async function loadMyAppointments() {
    const patientId = document.getElementById('patientId')?.value;
    if (!patientId) return;

    try {
        const response = await fetch(`${API_BASE}/appointments/patient/${patientId}`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            myAppointments = await response.json();
            renderMyAppointments(myAppointments);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

function renderMyAppointments(appointments) {
    const tbody = document.getElementById('myAppointmentsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-results">No appointments found.</td></tr>';
        return;
    }

    appointments.forEach(appt => {
        const date = new Date(appt.appointmentTime);
        const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const statusText = appt.status === 0 ? 'Scheduled' : 'Completed';
        const badgeClass = appt.status === 0 ? 'badge-scheduled' : 'badge-completed';
        const doctorName = appt.doctor ? appt.doctor.name : 'Unknown';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doctorName}</td>
            <td>${appt.doctor ? appt.doctor.specialty : ''}</td>
            <td>${dateStr}</td>
            <td>${timeStr}</td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Filters ---

function setupPatientFilters() {
    const searchInput = document.getElementById('doctorSearchPatient');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            const filtered = allDoctorsForPatient.filter(d =>
                d.name.toLowerCase().includes(term)
            );
            renderDoctorsForPatient(filtered);
        });
    }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', initPatientDashboard);
