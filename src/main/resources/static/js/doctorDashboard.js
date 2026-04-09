// =============================================
// doctorDashboard.js - Doctor Dashboard Logic
// =============================================

let allAppointments = [];
let currentDoctorId = null;

async function initDoctorDashboard() {
    renderHeader('doctor');
    currentDoctorId = getDoctorIdFromPage();
    await loadAppointments();
    setupDoctorFilters();
}

function getDoctorIdFromPage() {
    const el = document.getElementById('doctorId');
    return el ? el.value : null;
}

// --- Load and Render Appointments ---

async function loadAppointments() {
    if (!currentDoctorId) return;

    try {
        allAppointments = await DoctorService.getAppointments(currentDoctorId);
        renderAppointments(allAppointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        document.getElementById('appointmentTableBody').innerHTML =
            '<tr><td colspan="6" class="no-results">Failed to load appointments.</td></tr>';
    }
}

function renderAppointments(appointments) {
    const tbody = document.getElementById('appointmentTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-results">No appointments found.</td></tr>';
        return;
    }

    appointments.forEach(appt => {
        const date = new Date(appt.appointmentTime);
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
        const statusText = appt.status === 0 ? 'Scheduled' : 'Completed';
        const badgeClass = appt.status === 0 ? 'badge-scheduled' : 'badge-completed';
        const patientName = appt.patient ? appt.patient.name : 'Unknown';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${appt.id}</td>
            <td>${patientName}</td>
            <td>${dateStr}</td>
            <td>${timeStr}</td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="viewPrescriptions('${patientName}')">
                    Prescriptions
                </button>
                ${appt.status === 1 ? `
                    <button class="btn btn-primary btn-sm" onclick="openPrescribeModal(${appt.id}, '${patientName}')">
                        Prescribe
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Filters ---

function setupDoctorFilters() {
    const searchInput = document.getElementById('appointmentSearch');
    const dateFilter = document.getElementById('dateFilter');

    if (searchInput) {
        searchInput.addEventListener('input', applyDoctorFilters);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', applyDoctorFilters);
    }
}

function applyDoctorFilters() {
    const searchTerm = document.getElementById('appointmentSearch')?.value?.toLowerCase() || '';
    const dateValue = document.getElementById('dateFilter')?.value || '';

    let filtered = allAppointments;

    if (searchTerm) {
        filtered = filtered.filter(appt =>
            appt.patient && appt.patient.name.toLowerCase().includes(searchTerm)
        );
    }

    if (dateValue) {
        filtered = filtered.filter(appt => {
            const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
            return apptDate === dateValue;
        });
    }

    renderAppointments(filtered);
}

// --- View Patient Prescriptions ---

async function viewPrescriptions(patientName) {
    try {
        const prescriptions = await PatientService.getPrescriptions(patientName);

        if (prescriptions.length === 0) {
            showDynamicModal('Prescriptions - ' + patientName,
                '<p class="no-results">No prescriptions found for this patient.</p>'
            );
            return;
        }

        const listHtml = prescriptions.map(p => `
            <li class="prescription-item">
                <div class="med-name">${p.medication} - ${p.dosage}</div>
                <div class="med-detail">${p.doctorNotes || 'No notes'}</div>
            </li>
        `).join('');

        showDynamicModal('Prescriptions - ' + patientName,
            `<ul class="prescription-list">${listHtml}</ul>`
        );
    } catch (error) {
        alert('Failed to load prescriptions: ' + error.message);
    }
}

// --- Prescribe Medication ---

function openPrescribeModal(appointmentId, patientName) {
    const formHtml = `
        <form id="prescribeForm" onsubmit="handlePrescribe(event)">
            <input type="hidden" id="prescAppointmentId" value="${appointmentId}" />
            <input type="hidden" id="prescPatientName" value="${patientName}" />
            <div class="form-group">
                <label>Patient</label>
                <input type="text" value="${patientName}" disabled />
            </div>
            <div class="form-group">
                <label>Medication</label>
                <input type="text" id="prescMedication" required placeholder="e.g., Paracetamol" />
            </div>
            <div class="form-group">
                <label>Dosage</label>
                <input type="text" id="prescDosage" required placeholder="e.g., 500mg" />
            </div>
            <div class="form-group">
                <label>Doctor Notes</label>
                <input type="text" id="prescNotes" placeholder="e.g., Take 1 tablet every 6 hours" />
            </div>
            <button type="submit" class="btn btn-primary btn-full">Submit Prescription</button>
        </form>
    `;

    showDynamicModal('Prescribe Medication', formHtml);
}

async function handlePrescribe(event) {
    event.preventDefault();

    const data = {
        appointmentId: parseInt(document.getElementById('prescAppointmentId').value),
        patientName: document.getElementById('prescPatientName').value,
        medication: document.getElementById('prescMedication').value,
        dosage: document.getElementById('prescDosage').value,
        doctorNotes: document.getElementById('prescNotes').value
    };

    try {
        await PatientService.createPrescription(data);
        closeModal('dynamicModal');
        alert('Prescription created successfully.');
    } catch (error) {
        alert('Failed to create prescription: ' + error.message);
    }
}

// --- Init on page load ---
document.addEventListener('DOMContentLoaded', initDoctorDashboard);
