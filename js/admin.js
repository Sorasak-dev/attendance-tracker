let allRecords = [];
let filteredRecords = [];

function loadAllData() {
    allRecords = Storage.getAllRecords();
    filteredRecords = [...allRecords];
    
    updateStatistics();
    displayRecords();
}

function updateStatistics() {
    const stats = Storage.getStatistics();
    
    const totalRecordsEl = document.getElementById('totalRecords');
    const totalEmployeesEl = document.getElementById('totalEmployees');
    const todayRecordsEl = document.getElementById('todayRecords');
    
    if (totalRecordsEl) totalRecordsEl.textContent = stats.totalRecords;
    if (totalEmployeesEl) totalEmployeesEl.textContent = stats.totalEmployees;
    if (todayRecordsEl) todayRecordsEl.textContent = stats.todayRecords;
}

function displayRecords() {
    const tbody = document.getElementById('recordsTableBody');
    if (!tbody) return;

    if (filteredRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">ไม่มีข้อมูล</td></tr>';
        return;
    }

    filteredRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let html = '';
    filteredRecords.forEach(record => {
        const timeType = CONFIG.TIME_TYPES[record.type];
        const typeClass = record.type.replace('clock-', '').replace('-', '');
        const distanceText = GeoLocation.formatDistance(record.distance);
        
        html += `
            <tr>
                <td>${record.employeeId}</td>
                <td>${record.employeeName}</td>
                <td>${formatDate(new Date(record.timestamp))}</td>
                <td>${formatTime(new Date(record.timestamp))}</td>
                <td>
                    <span class="type-badge type-${typeClass}">
                        ${timeType.label}
                    </span>
                </td>
                <td>
                    <a href="#" onclick="GeoLocation.openInGoogleMaps(${record.location.lat}, ${record.location.lng}); return false;">
                        ${distanceText}
                    </a>
                </td>
                <td>
                    <img src="${record.photo}" alt="Photo" onclick="showImageModal('${record.photo}')">
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecord('${record.id}')">
                        ลบ
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function filterRecords() {
    const employeeId = document.getElementById('filterEmployee').value.trim().toLowerCase();
    const filterDate = document.getElementById('filterDate').value;

    filteredRecords = allRecords.filter(record => {
        let matches = true;

        if (employeeId) {
            matches = matches && record.employeeId.toLowerCase().includes(employeeId);
        }

        if (filterDate) {
            const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
            matches = matches && recordDate === filterDate;
        }

        return matches;
    });

    displayRecords();
}

function resetFilter() {
    document.getElementById('filterEmployee').value = '';
    document.getElementById('filterDate').value = '';
    
    filteredRecords = [...allRecords];
    displayRecords();
}

function deleteRecord(id) {
    if (!confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
        return;
    }

    const success = Storage.deleteRecord(id);
    
    if (success) {
        showAlert('ลบข้อมูลสำเร็จ', 'success');
        loadAllData();
    } else {
        showAlert('เกิดข้อผิดพลาดในการลบ', 'danger');
    }
}

function clearAllData() {
    const confirmation = confirm(
        'คำเตือน!\n\nคุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?\nการกระทำนี้ไม่สามารถยกเลิกได้!'
    );
    
    if (!confirmation) return;

    const doubleConfirm = confirm('กรุณายืนยันอีกครั้ง: ลบข้อมูลทั้งหมดจริงหรือไม่?');
    
    if (!doubleConfirm) return;

    const success = Storage.clearAllRecords();
    
    if (success) {
        showAlert('ลบข้อมูลทั้งหมดสำเร็จ', 'success');
        loadAllData();
    } else {
        showAlert('เกิดข้อผิดพลาดในการลบ', 'danger');
    }
}

function exportToCSV() {
    if (filteredRecords.length === 0) {
        alert('ไม่มีข้อมูลให้ Export');
        return;
    }

    Storage.exportToCSV();
    showAlert('Export ไฟล์สำเร็จ', 'success');
}

function showImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.style.display = 'block';
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeModal();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    
    const filterEmployee = document.getElementById('filterEmployee');
    const filterDate = document.getElementById('filterDate');
    
    if (filterEmployee) {
        filterEmployee.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filterRecords();
        });
    }
    
    if (filterDate) {
        filterDate.addEventListener('change', filterRecords);
    }
});