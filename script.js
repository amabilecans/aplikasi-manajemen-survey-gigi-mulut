// Dental Health Survey Management System
class DentalSurveyApp {
    constructor() {
        this.currentPatientData = null;
        this.savedPatients = JSON.parse(localStorage.getItem('dentalSurveyData')) || [];
        this.selectedTooth = null;
        
        // Tooth condition codes
        this.permanentTeethCodes = {
            '0': 'Sehat',
            '1': 'Gigi Berlubang/Karies',
            '2': 'Tumpatan dengan karies',
            '3': 'Tumpatan tanpa karies',
            '4': 'Gigi dicabut karena karies',
            '5': 'Gigi dicabut karena sebab lain',
            '6': 'Fissure Sealant',
            '7': 'Protesa cekat/mahkota cekat/implan/veneer',
            '8': 'Gigi tidak tumbuh',
            '9': 'Lain-lain'
        };
        
        this.primaryTeethCodes = {
            'A': 'Sehat',
            'B': 'Gigi Berlubang/Karies',
            'C': 'Tumpatan dengan karies',
            'D': 'Tumpatan tanpa karies',
            'E': 'Gigi dicabut karena karies',
            'F': 'Fissure Sealant',
            'G': 'Protesa cekat/mahkota cekat/implan/veneer'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setDefaultDates();
    }
    
    setupEventListeners() {
        // Form submission
        document.getElementById('saveData').addEventListener('click', () => this.savePatientData());
        document.getElementById('resetForm').addEventListener('click', () => this.resetForm());
        document.getElementById('viewData').addEventListener('click', () => this.toggleDataDisplay());
        
        // Tooth selection
        document.querySelectorAll('.tooth').forEach(tooth => {
            tooth.addEventListener('click', (e) => this.selectTooth(e.target.closest('.tooth')));
        });
        
        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('conditionModal').addEventListener('click', (e) => {
            if (e.target.id === 'conditionModal') {
                this.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Referral status change handler
        document.querySelectorAll('input[name="referralStatus"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleReferralChange(e));
        });

        // Tooth condition change listener for index calculation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('condition-option')) {
                setTimeout(() => this.calculateIndices(), 100);
            }
        });
    }
    
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('examDate').value = today;
    }
    
    selectTooth(toothElement) {
        this.selectedTooth = toothElement;
        const toothNumber = toothElement.dataset.number;
        const toothType = toothElement.dataset.type;
        
        document.getElementById('selectedToothNumber').textContent = toothNumber;
        this.showConditionModal(toothType);
    }
    
    showConditionModal(toothType) {
        const modal = document.getElementById('conditionModal');
        const optionsContainer = document.getElementById('conditionOptions');
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Get appropriate codes based on tooth type
        const codes = toothType === 'primary' ? this.primaryTeethCodes : this.permanentTeethCodes;
        
        // Create condition options
        Object.entries(codes).forEach(([code, description]) => {
            const option = document.createElement('div');
            option.className = 'condition-option';
            option.dataset.code = code;
            
            option.innerHTML = `
                <span class="code" style="background: ${this.getConditionColor(code)}">${code}</span>
                <span class="description">${description}</span>
            `;
            
            option.addEventListener('click', () => this.selectCondition(code));
            optionsContainer.appendChild(option);
        });
        
        modal.style.display = 'block';
    }
    
    selectCondition(code) {
        if (this.selectedTooth) {
            const conditionElement = this.selectedTooth.querySelector('.tooth-condition');
            conditionElement.textContent = code;
            conditionElement.dataset.condition = code;
            this.selectedTooth.dataset.condition = code;
        }
        this.closeModal();
        
        // Calculate indices after condition selection
        this.calculateIndices();
    }
    
    closeModal() {
        document.getElementById('conditionModal').style.display = 'none';
        this.selectedTooth = null;
    }
    
    getConditionColor(code) {
        const colorMap = {
            '0': '#27ae60', 'A': '#27ae60',
            '1': '#e74c3c', 'B': '#e74c3c',
            '2': '#f39c12', 'C': '#f39c12',
            '3': '#3498db', 'D': '#3498db',
            '4': '#8e44ad', 'E': '#8e44ad',
            '5': '#95a5a6',
            '6': '#1abc9c', 'F': '#1abc9c',
            '7': '#f1c40f', 'G': '#f1c40f',
            '8': '#34495e',
            '9': '#e67e22'
        };
        return colorMap[code] || '#3498db';
    }
    
    savePatientData() {
        // Validate form
        const form = document.getElementById('patientForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Collect patient data
        const patientData = {
            id: Date.now(),
            name: document.getElementById('patientName').value,
            birthDate: document.getElementById('birthDate').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            occupation: document.getElementById('occupation').value,
            age: parseInt(document.getElementById('age').value),
            address: document.getElementById('address').value,
            religion: document.getElementById('religion').value,
            examDate: document.getElementById('examDate').value,
            teethConditions: this.collectTeethConditions(),
            // New health assessment data
            bleedingGums: document.querySelector('input[name="bleedingGums"]:checked').value,
            oralLesions: document.querySelector('input[name="oralLesions"]:checked').value,
            indices: this.calculateIndices(),
            treatmentRecommendations: document.getElementById('treatmentRecommendations').value,
            referralStatus: document.querySelector('input[name="referralStatus"]:checked').value,
            referralTo: document.getElementById('referralTo').value,
            referralReason: document.getElementById('referralReason').value,
            createdAt: new Date().toISOString(),
            visitNumber: 1,
            totalVisits: 1
        };
        
        // Calculate age from birth date for validation
        const calculatedAge = this.calculateAge(patientData.birthDate);
        if (Math.abs(patientData.age - calculatedAge) > 1) {
            this.showNotification('Umur tidak sesuai dengan tanggal lahir!', 'warning');
            return;
        }
        
        // Check if patient already exists
        const existingPatientIndex = this.savedPatients.findIndex(
            p => p.name === patientData.name && 
                 p.birthDate === patientData.birthDate
        );
        
        if (existingPatientIndex !== -1) {
            // Update existing patient
            const existingPatient = this.savedPatients[existingPatientIndex];
            patientData.visitNumber = existingPatient.totalVisits + 1;
            patientData.totalVisits = existingPatient.totalVisits + 1;
            patientData.id = existingPatient.id; // Keep same ID
            
            // Add new visit data
            if (!existingPatient.visits) {
                existingPatient.visits = [];
            }
            existingPatient.visits.push({
                visitNumber: patientData.visitNumber,
                examDate: patientData.examDate,
                teethConditions: patientData.teethConditions,
                createdAt: patientData.createdAt
            });
            
            // Update latest data
            existingPatient.teethConditions = patientData.teethConditions;
            existingPatient.examDate = patientData.examDate;
            existingPatient.createdAt = patientData.createdAt;
            
            this.savedPatients[existingPatientIndex] = existingPatient;
            this.showNotification(`Data kunjungan ke-${patientData.visitNumber} berhasil disimpan!`, 'success');
        } else {
            // New patient
            patientData.visits = [{
                visitNumber: 1,
                examDate: patientData.examDate,
                teethConditions: patientData.teethConditions,
                createdAt: patientData.createdAt
            }];
            
            this.savedPatients.push(patientData);
            this.showNotification('Data pasien baru berhasil disimpan!', 'success');
        }
        
        localStorage.setItem('dentalSurveyData', JSON.stringify(this.savedPatients));
        
        // Reset form
        this.resetForm();
    }
    
    collectTeethConditions() {
        const conditions = {};
        document.querySelectorAll('.tooth').forEach(tooth => {
            const number = tooth.dataset.number;
            const condition = tooth.dataset.condition;
            if (condition) {
                conditions[number] = {
                    condition: condition,
                    type: tooth.dataset.type,
                    description: tooth.dataset.type === 'primary' ? 
                        this.primaryTeethCodes[condition] : 
                        this.permanentTeethCodes[condition]
                };
            }
        });
        return conditions;
    }
    
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
    
    resetForm() {
        // Reset form fields
        document.getElementById('patientForm').reset();
        
        // Reset tooth conditions
        document.querySelectorAll('.tooth').forEach(tooth => {
            const conditionElement = tooth.querySelector('.tooth-condition');
            conditionElement.textContent = '-';
            conditionElement.dataset.condition = '';
            tooth.dataset.condition = '';
        });

        // Reset health assessment fields
        document.querySelector('input[name="bleedingGums"][value="0"]').checked = true;
        document.querySelector('input[name="oralLesions"][value="0"]').checked = true;
        document.getElementById('treatmentRecommendations').value = '';
        document.querySelector('input[name="referralStatus"][value="Tidak Dirujuk"]').checked = true;
        document.getElementById('referralTo').value = '';
        document.getElementById('referralReason').value = '';
        document.getElementById('referralDetails').style.display = 'none';

        // Reset indices
        this.resetIndices();
        
        // Set default date
        this.setDefaultDates();
        
        this.showNotification('Form berhasil direset!', 'info');
    }
    
    toggleDataDisplay() {
        const dataDisplay = document.getElementById('dataDisplay');
        const isVisible = dataDisplay.style.display !== 'none';
        
        if (isVisible) {
            dataDisplay.style.display = 'none';
        } else {
            this.displaySavedData();
            dataDisplay.style.display = 'block';
            dataDisplay.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    displaySavedData() {
        const container = document.getElementById('savedDataList');
        
        if (this.savedPatients.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <h3>Belum ada data tersimpan</h3>
                    <p>Silakan input data pasien terlebih dahulu</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.savedPatients.map(patient => this.createPatientCard(patient)).join('');
    }
    
    createPatientCard(patient) {
        const teethWithConditions = Object.keys(patient.teethConditions).length;
        const conditionsSummary = this.createConditionsSummary(patient.teethConditions);
        const totalVisits = patient.totalVisits || 1;
        const visitHistory = this.createVisitHistory(patient);
        
        // Health assessment summary
        const healthAssessment = this.createHealthAssessmentSummary(patient);
        
        return `
            <div class="patient-record">
                <div class="patient-info">
                    <div class="info-item">
                        <span class="info-label">Nama Pasien</span>
                        <span class="info-value">${patient.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tanggal Lahir</span>
                        <span class="info-value">${this.formatDate(patient.birthDate)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Umur</span>
                        <span class="info-value">${patient.age} tahun</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Jenis Kelamin</span>
                        <span class="info-value">${patient.gender}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Pekerjaan</span>
                        <span class="info-value">${patient.occupation}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Alamat</span>
                        <span class="info-value">${patient.address}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Agama</span>
                        <span class="info-value">${patient.religion}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Kunjungan</span>
                        <span class="info-value">${totalVisits} kali</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Kunjungan Terakhir</span>
                        <span class="info-value">${this.formatDate(patient.examDate)}</span>
                    </div>
                </div>
                
                <div class="teeth-summary">
                    <h4>Ringkasan Kondisi Gigi (${teethWithConditions} gigi diperiksa)</h4>
                    <div class="teeth-conditions">
                        ${conditionsSummary}
                    </div>
                </div>

                ${healthAssessment}
                
                ${visitHistory}
                
                <div style="margin-top: 15px; text-align: right;">
                    <button onclick="dentalApp.deletePatient(${patient.id})" 
                            style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                        Hapus Data
                    </button>
                    <button onclick="dentalApp.exportPatientData(${patient.id})" 
                            style="background: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        Export Data
                    </button>
                </div>
            </div>
        `;
    }

    createVisitHistory(patient) {
        if (!patient.visits || patient.visits.length <= 1) {
            return '';
        }
        
        const visits = patient.visits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return `
            <div class="visit-history" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4>Riwayat Kunjungan (${patient.totalVisits} kunjungan)</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${visits.map(visit => `
                        <div style="padding: 10px; margin: 5px 0; background: white; border-radius: 5px; border-left: 3px solid #ff8c00;">
                            <strong>Kunjungan ke-${visit.visitNumber}</strong> - ${this.formatDate(visit.examDate)}
                            <br>
                            <small>${Object.keys(visit.teethConditions).length} gigi diperiksa</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // New methods for health assessment features
    handleReferralChange(event) {
        const referralDetails = document.getElementById('referralDetails');
        if (event.target.value === 'Dirujuk') {
            referralDetails.style.display = 'block';
        } else {
            referralDetails.style.display = 'none';
            document.getElementById('referralTo').value = '';
            document.getElementById('referralReason').value = '';
        }
    }

    calculateIndices() {
        const teethConditions = this.collectTeethConditions();
        
        // Calculate def-t index (primary teeth)
        let dCount = 0, eCount = 0, fCount = 0;
        
        // Primary teeth numbers: 51-65, 71-85
        Object.entries(teethConditions).forEach(([number, data]) => {
            const num = parseInt(number);
            if ((num >= 51 && num <= 65) || (num >= 71 && num <= 85)) {
                if (data.condition === 'B') dCount++; // Karies
                if (data.condition === 'E') eCount++; // Dicabut karena karies
                if (data.condition === 'D' || data.condition === 'F') fCount++; // Tumpatan
            }
        });
        
        const def_t = dCount + eCount + fCount;
        
        // Calculate DMF-T index (permanent teeth)
        let DCount = 0, MCount = 0, FCount = 0;
        
        // Permanent teeth numbers: 11-48
        Object.entries(teethConditions).forEach(([number, data]) => {
            const num = parseInt(number);
            if (num >= 11 && num <= 48) {
                if (data.condition === '1') DCount++; // Karies
                if (data.condition === '4') MCount++; // Dicabut karena karies
                if (data.condition === '3' || data.condition === '7') FCount++; // Tumpatan
            }
        });
        
        const DMF_T = DCount + MCount + FCount;
        
        // Update display
        document.getElementById('d-value').textContent = dCount;
        document.getElementById('e-value').textContent = eCount;
        document.getElementById('f-value').textContent = fCount;
        document.getElementById('def-t-value').textContent = def_t;
        
        document.getElementById('D-value').textContent = DCount;
        document.getElementById('M-value').textContent = MCount;
        document.getElementById('F-value').textContent = FCount;
        document.getElementById('DMF-T-value').textContent = DMF_T;
        
        return {
            def_t: { d: dCount, e: eCount, f: fCount, total: def_t },
            DMF_T: { D: DCount, M: MCount, F: FCount, total: DMF_T }
        };
    }

    resetIndices() {
        document.getElementById('d-value').textContent = '0';
        document.getElementById('e-value').textContent = '0';
        document.getElementById('f-value').textContent = '0';
        document.getElementById('def-t-value').textContent = '0';
        
        document.getElementById('D-value').textContent = '0';
        document.getElementById('M-value').textContent = '0';
        document.getElementById('F-value').textContent = '0';
        document.getElementById('DMF-T-value').textContent = '0';
    }

    createHealthAssessmentSummary(patient) {
        if (!patient.indices) return '';
        
        const { def_t, DMF_T } = patient.indices;
        
        let summary = `
            <div class="health-summary" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4>Ringkasan Pemeriksaan Tambahan</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                    <div>
                        <strong>Gusi berdarah:</strong> ${patient.bleedingGums === '1' ? 'Ya' : 'Tidak'}<br>
                        <strong>Lesi Mukosa Oral:</strong> ${patient.oralLesions === '1' ? 'Ya' : 'Tidak'}
                    </div>
                    <div>
                        <strong>Indeks def-t:</strong> ${def_t.total}<br>
                        <strong>Indeks DMF-T:</strong> ${DMF_T.total}
                    </div>
                </div>
        `;
        
        if (patient.treatmentRecommendations) {
            summary += `
                <div style="margin-top: 10px;">
                    <strong>Rekomendasi Perawatan:</strong><br>
                    ${patient.treatmentRecommendations}
                </div>
            `;
        }
        
        if (patient.referralStatus === 'Dirujuk') {
            summary += `
                <div style="margin-top: 10px;">
                    <strong>Rujukan:</strong> ${patient.referralTo || 'Tidak ditentukan'}<br>
                    <strong>Alasan:</strong> ${patient.referralReason || 'Tidak ditentukan'}
                </div>
            `;
        }
        
        summary += '</div>';
        return summary;
    }
    
    createConditionsSummary(teethConditions) {
        const conditionCounts = {};
        
        Object.values(teethConditions).forEach(tooth => {
            const condition = tooth.condition;
            const description = tooth.description;
            const key = `${condition}-${description}`;
            
            if (!conditionCounts[key]) {
                conditionCounts[key] = {
                    code: condition,
                    description: description,
                    count: 0,
                    color: this.getConditionColor(condition)
                };
            }
            conditionCounts[key].count++;
        });
        
        return Object.values(conditionCounts).map(item => `
            <span class="condition-badge" style="background: ${item.color}">
                ${item.code}: ${item.description} (${item.count})
            </span>
        `).join('');
    }
    
    deletePatient(patientId) {
        if (confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
            this.savedPatients = this.savedPatients.filter(patient => patient.id !== patientId);
            localStorage.setItem('dentalSurveyData', JSON.stringify(this.savedPatients));
            this.displaySavedData();
            this.showNotification('Data pasien berhasil dihapus!', 'success');
        }
    }
    
    exportPatientData(patientId) {
        const patient = this.savedPatients.find(p => p.id === patientId);
        if (!patient) return;
        
        // Create detailed report
        const report = this.generatePatientReport(patient);
        
        // Create and download file
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_${patient.name.replace(/\s+/g, '_')}_${patient.examDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data berhasil diexport!', 'success');
    }
    
    generatePatientReport(patient) {
        const totalVisits = patient.totalVisits || 1;
        const visitNumber = patient.visitNumber || 1;
        
        let report = `LAPORAN PEMERIKSAAN KESEHATAN GIGI DAN MULUT\n`;
        report += `================================================\n\n`;
        report += `Nama Pasien    : ${patient.name}\n`;
        report += `Tanggal Lahir  : ${this.formatDate(patient.birthDate)}\n`;
        report += `Umur           : ${patient.age} tahun\n`;
        report += `Jenis Kelamin  : ${patient.gender}\n`;
        report += `Pekerjaan      : ${patient.occupation}\n`;
        report += `Alamat         : ${patient.address}\n`;
        report += `Agama          : ${patient.religion}\n`;
        report += `Kunjungan      : ${visitNumber} dari ${totalVisits} kunjungan\n`;
        report += `Tanggal Periksa: ${this.formatDate(patient.examDate)}\n\n`;
        
        report += `KONDISI GIGI:\n`;
        report += `=============\n`;
        
        // Group by jaw
        const upperTeeth = {};
        const lowerTeeth = {};
        
        Object.entries(patient.teethConditions).forEach(([number, data]) => {
            const num = parseInt(number);
            if (num >= 11 && num <= 28 || num >= 51 && num <= 65) {
                upperTeeth[number] = data;
            } else {
                lowerTeeth[number] = data;
            }
        });
        
        if (Object.keys(upperTeeth).length > 0) {
            report += `\nRahang Atas:\n`;
            Object.entries(upperTeeth).forEach(([number, data]) => {
                report += `  Gigi ${number}: ${data.condition} - ${data.description}\n`;
            });
        }
        
        if (Object.keys(lowerTeeth).length > 0) {
            report += `\nRahang Bawah:\n`;
            Object.entries(lowerTeeth).forEach(([number, data]) => {
                report += `  Gigi ${number}: ${data.condition} - ${data.description}\n`;
            });
        }
        
        // Summary
        const conditionCounts = {};
        Object.values(patient.teethConditions).forEach(tooth => {
            const key = tooth.description;
            conditionCounts[key] = (conditionCounts[key] || 0) + 1;
        });
        
        report += `\nRINGKASAN:\n`;
        report += `==========\n`;
        Object.entries(conditionCounts).forEach(([condition, count]) => {
            report += `${condition}: ${count} gigi\n`;
        });
        
        report += `\nTotal gigi diperiksa: ${Object.keys(patient.teethConditions).length}\n`;
        report += `\nLaporan dibuat pada: ${new Date().toLocaleString('id-ID')}\n`;
        
        // Add visit history if multiple visits
        if (patient.visits && patient.visits.length > 1) {
            report += `\nRIWAYAT KUNJUNGAN:\n`;
            report += `==================\n`;
            
            const visits = patient.visits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            visits.forEach(visit => {
                report += `Kunjungan ke-${visit.visitNumber} - ${this.formatDate(visit.examDate)}\n`;
                const visitTeethCount = Object.keys(visit.teethConditions).length;
                report += `Gigi diperiksa: ${visitTeethCount}\n`;
                
                // Add conditions for this visit
                const visitConditions = {};
                Object.values(visit.teethConditions).forEach(tooth => {
                    const key = tooth.description;
                    visitConditions[key] = (visitConditions[key] || 0) + 1;
                });
                
                Object.entries(visitConditions).forEach(([condition, count]) => {
                    report += `  ${condition}: ${count} gigi\n`;
                });
                report += '\n';
            });
        }
        
        return report;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        notification.style.background = colors[type] || colors.info;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
const dentalApp = new DentalSurveyApp();

// Additional utility functions
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add keyboard navigation for teeth
    document.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('tooth')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            }
        }
    });
    
    // Add accessibility attributes
    document.querySelectorAll('.tooth').forEach(tooth => {
        tooth.setAttribute('tabindex', '0');
        tooth.setAttribute('role', 'button');
        tooth.setAttribute('aria-label', `Gigi nomor ${tooth.dataset.number}`);
    });
});

// Export functionality for the entire dataset
function exportAllData() {
    const allData = JSON.parse(localStorage.getItem('dentalSurveyData')) || [];
    if (allData.length === 0) {
        dentalApp.showNotification('Tidak ada data untuk diexport!', 'warning');
        return;
    }
    
    let csvContent = 'Nama,Tanggal Lahir,Umur,Jenis Kelamin,Pekerjaan,Alamat,Agama,Total Kunjungan,Tanggal Pemeriksaan,Jumlah Gigi Diperiksa,Kondisi Gigi,Status Rujukan,Tujuan Rujukan,Alasan Rujukan\n';
    
    allData.forEach(patient => {
        const teethCount = Object.keys(patient.teethConditions).length;
        const conditions = Object.values(patient.teethConditions)
            .map(tooth => `${tooth.condition}:${tooth.description}`)
            .join(';');
        const totalVisits = patient.totalVisits || 1;
        const referralStatus = patient.referralStatus || '';
        const referralTo = patient.referralTo || '';
        const referralReason = patient.referralReason || '';
        
        csvContent += `"${patient.name}","${patient.birthDate}",${patient.age},"${patient.gender}","${patient.occupation}","${patient.address}","${patient.religion}",${totalVisits},"${patient.examDate}",${teethCount},"${conditions}","${referralStatus}","${referralTo}","${referralReason}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Survey_Kesehatan_Gigi_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    dentalApp.showNotification('Semua data berhasil diexport!', 'success');
}

// Add export all button to the action buttons
document.addEventListener('DOMContentLoaded', function() {
    const actionButtons = document.querySelector('.action-buttons');
    const exportAllBtn = document.createElement('button');
    exportAllBtn.type = 'button';
    exportAllBtn.className = 'btn btn-info';
    exportAllBtn.textContent = 'Export Semua Data';
    exportAllBtn.onclick = exportAllData;
    actionButtons.appendChild(exportAllBtn);
});
