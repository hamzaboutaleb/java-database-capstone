// =============================================
// adminDashboard.js - Admin Dashboard Logic
// =============================================

let allDoctors = [];

async function initAdminDashboard() {
    renderHeader('admin');
    await loadDoctors();
    setupAdminFilters();
    setupAddDoctorForm();
}

// --- Load and Render Doctors ---

async function loadDoctors() {
    try {
        allDoctors = await DoctorService.getAll();
        renderDoctors(allDoctors);
        updateStats(allDoctors);
        populateSpecialtyFilter(allDoctors);
    } catch (error) {
        console.error('Error loading doctors:', error);
        document.getElementById('doctorGrid').innerHTML =
            '<p class="no-results">Failed to load doctors. Please try again.</p>';
    }
}

function renderDoctors(doctors) {
    const grid = document.getElementById('doctorGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (doctors.length === 0) {
        grid.innerHTML = '<p class="no-results">No doctors found.</p>';
        return;
    }

    doctors.forEach(doctor => {
        const card = createDoctorCard(doctor, {
            showDelete: true,
            onDelete: handleDeleteDoctor
        });
        grid.appendChild(card);
    });
}

function updateStats(doctors) {
    const totalEl = document.getElementById('totalDoctors');
    if (totalEl) totalEl.textContent = doctors.length;

    const specialties = new Set(doctors.map(d => d.specialty));
    const specEl = document.getElementById('totalSpecialties');
    if (specEl) specEl.textContent = specialties.size;
}

function populateSpecialtyFilter(doctors) {
    const select = document.getElementById('specialtyFilter');
    if (!select) return;

    const specialties = [...new Set(doctors.map(d => d.specialty))].sort();
    select.innerHTML = '<option value="">All Specialties</option>';
    specialties.forEach(s => {
        select.innerHTML += `<option value="${s}">${s}</option>`;
    });
}

// --- Filters ---

function setupAdminFilters() {
    const searchInput = document.getElementById('doctorSearch');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const timeFilter = document.getElementById('timeFilter');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', applyFilters);
    }
    if (timeFilter) {
        timeFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    const name = document.getElementById('doctorSearch')?.value || '';
    const specialty = document.getElementById('specialtyFilter')?.value || '';
    const time = document.getElementById('timeFilter')?.value || '';

    const filtered = DoctorService.filterDoctors(allDoctors, { name, specialty, time });
    renderDoctors(filtered);
}

// --- Delete Doctor ---

async function handleDeleteDoctor(doctorId) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
        await DoctorService.delete(doctorId);
        allDoctors = allDoctors.filter(d => d.id !== doctorId);
        renderDoctors(allDoctors);
        updateStats(allDoctors);
    } catch (error) {
        alert('Failed to delete doctor: ' + error.message);
    }
}

// --- Add Doctor ---

function setupAddDoctorForm() {
    const form = document.getElementById('addDoctorForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const doctorData = {
            name: document.getElementById('newDoctorName').value,
            email: document.getElementById('newDoctorEmail').value,
            password: document.getElementById('newDoctorPassword').value,
            phone: document.getElementById('newDoctorPhone').value,
            specialty: document.getElementById('newDoctorSpecialty').value,
            availableTimes: document.getElementById('newDoctorTimes').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t)
        };

        try {
            const newDoctor = await DoctorService.create(doctorData);
            allDoctors.push(newDoctor);
            renderDoctors(allDoctors);
            updateStats(allDoctors);
            populateSpecialtyFilter(allDoctors);
            closeModal('addDoctorModal');
            form.reset();
        } catch (error) {
            alert('Failed to add doctor: ' + error.message);
        }
    });
}

// --- Init on page load ---
document.addEventListener('DOMContentLoaded', initAdminDashboard);
