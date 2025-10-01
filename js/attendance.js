async function recordTime(type) {
    try {
        const employeeId = document.getElementById('employeeId').value.trim();
        const employeeName = document.getElementById('employeeName').value.trim();

        if (!employeeId || !employeeName) {
            showAlert(CONFIG.MESSAGES.ERROR_NO_EMPLOYEE, 'danger');
            return;
        }

        if (!FacialRecognition.hasCapturedImage()) {
            showAlert(CONFIG.MESSAGES.ERROR_NO_PHOTO, 'danger');
            return;
        }

        const locationResult = await GeoLocation.checkAndUpdateUI();
        
        if (!locationResult.isInRange) {
            showAlert(CONFIG.MESSAGES.ERROR_LOCATION, 'danger');
            return;
        }

        const record = {
            id: Storage.generateId(),
            employeeId: employeeId,
            employeeName: employeeName,
            type: type,
            timestamp: new Date().toISOString(),
            location: {
                lat: GeoLocation.currentPosition.lat,
                lng: GeoLocation.currentPosition.lng
            },
            distance: locationResult.distance,
            photo: FacialRecognition.getCapturedImage()
        };

        const success = Storage.saveRecord(record);

        if (success) {
            showAlert(CONFIG.MESSAGES.SUCCESS, 'success');
            
            displayTodayRecords();
            
            resetForm();
        } else {
            showAlert('เกิดข้อผิดพลาดในการบันทึก', 'danger');
        }

    } catch (error) {
        console.error('Record time error:', error);
        showAlert('เกิดข้อผิดพลาด: ' + error.message, 'danger');
    }
}

function displayTodayRecords() {
    const container = document.getElementById('todayRecords');
    if (!container) return;

    const records = Storage.getTodayRecords();

    if (records.length === 0) {
        container.innerHTML = '<p class="no-data">ยังไม่มีข้อมูลการลงเวลาวันนี้</p>';
        return;
    }

    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let html = '';
    records.forEach(record => {
        const timeType = CONFIG.TIME_TYPES[record.type];
        const distanceText = GeoLocation.formatDistance(record.distance);
        html += `
            <div class="record-item">
                <div class="record-item-header">
                    <span class="record-type">${timeType.label}</span>
                    <span class="record-time">${formatTime(new Date(record.timestamp))}</span>
                </div>
                <div class="record-location">
                    ${record.employeeName} (${record.employeeId})
                    • ${distanceText} จากสำนักงาน
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function resetForm() {
    FacialRecognition.retakePhoto();
}

document.addEventListener('DOMContentLoaded', () => {
    displayTodayRecords();
    setInterval(() => {
        displayTodayRecords();
    }, 30000);
});