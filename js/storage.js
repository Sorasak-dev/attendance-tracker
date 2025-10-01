const Storage = {

    saveRecord(record) {
        try {
            const records = this.getAllRecords();
            records.push(record);
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(records));
            return true;
        } catch (error) {
            console.error('Error saving record:', error);
            return false;
        }
    },

    getAllRecords() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting records:', error);
            return [];
        }
    },

    getRecordsByDate(date) {
        const records = this.getAllRecords();
        const targetDate = formatDate(new Date(date));
        return records.filter(record => 
            formatDate(new Date(record.timestamp)) === targetDate
        );
    },

    getRecordsByEmployeeId(employeeId) {
        const records = this.getAllRecords();
        return records.filter(record => 
            record.employeeId === employeeId
        );
    },

    getTodayRecords() {
        const today = new Date();
        return this.getRecordsByDate(today);
    },

    getTodayRecordsByEmployee(employeeId) {
        const todayRecords = this.getTodayRecords();
        return todayRecords.filter(record => 
            record.employeeId === employeeId
        );
    },

    deleteRecord(id) {
        try {
            const records = this.getAllRecords();
            const filtered = records.filter(record => record.id !== id);
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting record:', error);
            return false;
        }
    },

    clearAllRecords() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing records:', error);
            return false;
        }
    },

    getUniqueEmployeeCount() {
        const records = this.getAllRecords();
        const uniqueIds = [...new Set(records.map(r => r.employeeId))];
        return uniqueIds.length;
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    exportToCSV() {
        const records = this.getAllRecords();
        if (records.length === 0) {
            alert('ไม่มีข้อมูลให้ Export');
            return;
        }

        let csv = 'รหัสพนักงาน,ชื่อ-นามสกุล,วันที่,เวลา,ประเภท,ละติจูด,ลองจิจูด,ระยะทาง(m)\n';

        records.forEach(record => {
            csv += `${record.employeeId},`;
            csv += `${record.employeeName},`;
            csv += `${formatDate(new Date(record.timestamp))},`;
            csv += `${formatTime(new Date(record.timestamp))},`;
            csv += `${CONFIG.TIME_TYPES[record.type].label},`;
            csv += `${record.location.lat},`;
            csv += `${record.location.lng},`;
            csv += `${record.distance}\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    getStatistics() {
        const records = this.getAllRecords();
        return {
            totalRecords: records.length,
            totalEmployees: this.getUniqueEmployeeCount(),
            todayRecords: this.getTodayRecords().length
        };
    }
};