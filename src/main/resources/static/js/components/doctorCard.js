// =============================================
// doctorCard.js - Doctor Card Component
// Reusable for admin and patient views
// =============================================

function createDoctorCard(doctor, options = {}) {
    const { showDelete = false, showBook = false, onDelete, onBook } = options;

    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.dataset.doctorId = doctor.id;

    const timesHtml = doctor.availableTimes && doctor.availableTimes.length
        ? doctor.availableTimes.map(t => `<span class="time-slot">${t}</span>`).join('')
        : '<span class="no-times">No availability set</span>';

    let actionsHtml = '';
    if (showDelete) {
        actionsHtml += `<button class="btn btn-danger btn-sm delete-doctor-btn" data-id="${doctor.id}">Delete</button>`;
    }
    if (showBook) {
        actionsHtml += `<button class="btn btn-primary btn-sm book-doctor-btn" data-id="${doctor.id}">Book</button>`;
    }

    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-name">${doctor.name}</h3>
            <span class="card-specialty">${doctor.specialty}</span>
        </div>
        <div class="card-body">
            <div class="card-info">
                <span class="info-label">Email:</span>
                <span>${doctor.email}</span>
            </div>
            <div class="card-info">
                <span class="info-label">Phone:</span>
                <span>${doctor.phone}</span>
            </div>
            <div class="card-times">
                <span class="info-label">Available:</span>
                <div class="time-slots">${timesHtml}</div>
            </div>
        </div>
        ${actionsHtml ? `<div class="card-actions">${actionsHtml}</div>` : ''}
    `;

    // Attach event listeners
    if (showDelete && onDelete) {
        card.querySelector('.delete-doctor-btn')?.addEventListener('click', () => onDelete(doctor.id));
    }
    if (showBook && onBook) {
        card.querySelector('.book-doctor-btn')?.addEventListener('click', () => onBook(doctor.id));
    }

    return card;
}

// Inject card styles
(function injectDoctorCardStyles() {
    if (document.getElementById('doctorCardStyles')) return;
    const style = document.createElement('style');
    style.id = 'doctorCardStyles';
    style.textContent = `
        .doctor-card {
            background: var(--white);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow);
            overflow: hidden;
            transition: box-shadow 0.2s;
        }
        .doctor-card:hover {
            box-shadow: var(--shadow-md);
        }
        .card-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--gray-100);
        }
        .card-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 2px;
        }
        .card-specialty {
            font-size: 13px;
            color: var(--primary);
            font-weight: 500;
        }
        .card-body {
            padding: 16px 20px;
        }
        .card-info {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 8px;
            color: var(--gray-600);
        }
        .info-label {
            font-weight: 500;
            color: var(--gray-500);
        }
        .card-times {
            margin-top: 12px;
        }
        .time-slots {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
        }
        .time-slot {
            background: var(--gray-100);
            color: var(--gray-700);
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .no-times {
            font-size: 12px;
            color: var(--gray-400);
            font-style: italic;
        }
        .card-actions {
            padding: 12px 20px;
            border-top: 1px solid var(--gray-100);
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
    `;
    document.head.appendChild(style);
})();
