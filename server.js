require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis');
const stream = require('stream');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Validation functions
function validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        return `${fieldName} wajib diisi`;
    }
    return null;
}

function validateNIK(nik) {
    if (!nik || !/^\d{16}$/.test(nik)) {
        return 'NIK harus terdiri dari 16 digit angka';
    }
    return null;
}

function validatePhone(phone) {
    if (!phone || !/^\+62\d{9,15}$/.test(phone)) {
        return 'Nomor HP harus diawali dengan +62 dan diikuti 9-15 digit angka';
    }
    return null;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return 'Format email tidak valid';
    }
    return null;
}

function validatePostalCode(code) {
    if (!code || !/^\d{5}$/.test(code)) {
        return 'Kode Pos harus terdiri dari 5 digit angka';
    }
    return null;
}

function validateDate(date) {
    if (!date) {
        return 'Tanggal wajib diisi';
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return 'Format tanggal tidak valid';
    }
    return null;
}

function validateYear(year) {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (!year || isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 10) {
        return `Tahun harus antara 1900 dan ${currentYear + 10}`;
    }
    return null;
}

function validateFormData(formData) {
    const errors = [];
    
    // Required fields validation
    const requiredFields = [
        { field: 'ops-id', name: 'OpsID' },
        { field: 'nama', name: 'Nama Lengkap' },
        { field: 'nik', name: 'NIK KTP' },
        { field: 'tempat-lahir', name: 'Tempat Lahir' },
        { field: 'tanggal-lahir', name: 'Tanggal Lahir' },
        { field: 'jenis-kelamin', name: 'Jenis Kelamin' },
        { field: 'alamat-ktp', name: 'Alamat KTP' },
        { field: 'alamat-domisili', name: 'Alamat Domisili' },
        { field: 'rt-rw', name: 'RT/RW' },
        { field: 'no-rumah', name: 'No Rumah' },
        { field: 'kelurahan', name: 'Kelurahan' },
        { field: 'kecamatan', name: 'Kecamatan' },
        { field: 'kota', name: 'Kota' },
        { field: 'kode-pos', name: 'Kode Pos' },
        { field: 'agama', name: 'Agama' },
        { field: 'status-perkawinan', name: 'Status Perkawinan' },
        { field: 'kewarganegaraan', name: 'Kewarganegaraan' },
        { field: 'no-hp', name: 'No HP' },
        { field: 'no-wa', name: 'No WhatsApp' },
        { field: 'email', name: 'Email' },
        { field: 'tingkat-pendidikan', name: 'Tingkat Pendidikan' },
        { field: 'nama-sekolah', name: 'Nama Sekolah' },
        { field: 'jurusan', name: 'Jurusan' },
        { field: 'tahun-masuk', name: 'Tahun Masuk' },
        { field: 'tahun-lulus', name: 'Tahun Lulus' },
        { field: 'ipk', name: 'IPK' },
        { field: 'nama-kontak-darurat', name: 'Nama Kontak Darurat' },
        { field: 'no-hp-darurat', name: 'No HP Darurat' },
        { field: 'no-wa-darurat', name: 'No WhatsApp Darurat' },
        { field: 'hubungan-kontak-darurat', name: 'Hubungan Kontak Darurat' },
        { field: 'nama-bank', name: 'Nama Bank' },
        { field: 'no-rekening', name: 'Nomor Rekening' },
        { field: 'nama-penerima', name: 'Nama Penerima' },
        { field: 'nama-ibu', name: 'Nama Ibu' },
        { field: 'nama-ayah', name: 'Nama Ayah' }
    ];
    
    // Check required fields
    for (const { field, name } of requiredFields) {
        const error = validateRequired(formData[field], name);
        if (error) errors.push(error);
    }
    
    // Specific validations
    if (formData['nik']) {
        const nikError = validateNIK(formData['nik']);
        if (nikError) errors.push(nikError);
    }
    
    if (formData['no-hp']) {
        const phoneError = validatePhone(formData['no-hp']);
        if (phoneError) errors.push(phoneError);
    }
    
    if (formData['no-wa']) {
        const waError = validatePhone(formData['no-wa']);
        if (waError) errors.push(`WhatsApp: ${waError}`);
    }
    
    if (formData['no-hp-darurat']) {
        const emergencyPhoneError = validatePhone(formData['no-hp-darurat']);
        if (emergencyPhoneError) errors.push(`HP Darurat: ${emergencyPhoneError}`);
    }
    
    if (formData['no-wa-darurat']) {
        const emergencyWaError = validatePhone(formData['no-wa-darurat']);
        if (emergencyWaError) errors.push(`WhatsApp Darurat: ${emergencyWaError}`);
    }
    
    if (formData['email']) {
        const emailError = validateEmail(formData['email']);
        if (emailError) errors.push(emailError);
    }
    
    if (formData['kode-pos']) {
        const postalError = validatePostalCode(formData['kode-pos']);
        if (postalError) errors.push(postalError);
    }
    
    if (formData['tanggal-lahir']) {
        const dateError = validateDate(formData['tanggal-lahir']);
        if (dateError) errors.push(dateError);
    }
    
    if (formData['tahun-masuk']) {
        const yearError = validateYear(formData['tahun-masuk']);
        if (yearError) errors.push(`Tahun Masuk: ${yearError}`);
    }
    
    if (formData['tahun-lulus']) {
        const yearError = validateYear(formData['tahun-lulus']);
        if (yearError) errors.push(`Tahun Lulus: ${yearError}`);
    }
    
    // Validate conditional fields
    if (formData['agama'] === 'Lainnya') {
        const error = validateRequired(formData['agama-lainnya'], 'Agama Lainnya');
        if (error) errors.push(error);
    }
    
    if (formData['status-perkawinan'] === 'Lainnya') {
        const error = validateRequired(formData['status-perkawinan-lainnya'], 'Status Perkawinan Lainnya');
        if (error) errors.push(error);
    }
    
    if (formData['tingkat-pendidikan'] === 'Lainnya') {
        const error = validateRequired(formData['pendidikan-lainnya'], 'Tingkat Pendidikan Lainnya');
        if (error) errors.push(error);
    }
    
    if (formData['hubungan-kontak-darurat'] === 'Lainnya') {
        const error = validateRequired(formData['hubungan-lainnya'], 'Hubungan Lainnya');
        if (error) errors.push(error);
    }
    
    if (formData['nama-bank'] === 'Lainnya') {
        const error = validateRequired(formData['bank-lainnya'], 'Nama Bank Lainnya');
        if (error) errors.push(error);
    }
    
    return errors;
}

function validateFiles(files) {
    const errors = [];
    const requiredFiles = ['foto-ktp', 'foto-kk', 'buku-tabungan', 'foto-selfie'];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    // Check required files
    for (const requiredFile of requiredFiles) {
        const file = files.find(f => f.fieldname === requiredFile);
        if (!file) {
            const fileNames = {
                'foto-ktp': 'Foto KTP',
                'foto-kk': 'Foto KK',
                'buku-tabungan': 'Foto Buku Tabungan',
                'foto-selfie': 'Foto Selfie'
            };
            errors.push(`${fileNames[requiredFile]} wajib diunggah`);
        }
    }
    
    // Validate each file
    for (const file of files) {
        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
            errors.push(`File ${file.originalname} harus berformat JPG, JPEG, atau PNG`);
        }
        
        // Check file size
        if (file.size > maxSize) {
            errors.push(`File ${file.originalname} terlalu besar. Maksimal 5MB`);
        }
    }
    
    return errors;
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Multer setup for file uploads
const upload = multer();

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Check if required environment variables are set
function validateEnvironmentVariables() {
    const requiredVars = ['PROJECT_ID', 'PRIVATE_KEY_ID', 'PRIVATE_KEY', 'CLIENT_EMAIL', 'CLIENT_ID', 'CLIENT_X509_CERT_URL', 'FRONTEND_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars.join(', '));
        console.error('Please check your .env file and ensure all Google Service Account credentials are properly set.');
        process.exit(1);
    }
}

// Validate environment variables before proceeding
validateEnvironmentVariables();

const credentials = {
    type: "service_account",
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com"
};

const SPREADSHEET_ID = '1BNhyJfE2ejqAAXes1gz6HaBd2KijtG86xkGA1AbxXDY';
const DRIVE_FOLDER_ID = '1aqeH-9T7ttRSxL1OwMIVm7uc_AYT6nzQ';

async function getAuth() {
    const jwt = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: SCOPES,
    });
    return jwt;
}

async function getSpreadsheet() {
    const auth = await getAuth();
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
    await doc.loadInfo();
    return doc;
}

async function uploadToDrive(file, auth) {
    const drive = google.drive({ version: 'v3', auth });
    const fileMetadata = {
        name: file.originalname,
        parents: [DRIVE_FOLDER_ID],
    };
    const media = {
        mimeType: file.mimetype,
        body: new stream.PassThrough().end(file.buffer),
    };
    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
    });
    return response.data.webViewLink;
}

async function checkDuplicateNIK(nik) {
    try {
        const doc = await getSpreadsheet();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        
        // Check if NIK already exists
        const existingNIK = rows.find(row => row.get('nik') === nik);
        return !!existingNIK;
    } catch (error) {
        console.error('Error checking duplicate NIK:', error);
        throw new Error('Gagal memeriksa duplikasi NIK');
    }
}

app.post('/submit', upload.any(), async (req, res) => {
    try {
        const formData = req.body;
        const files = req.files;
        
        console.log('Received form submission:', {
            fieldsCount: Object.keys(formData).length,
            filesCount: files.length
        });
        
        // Validate form data
        const formErrors = validateFormData(formData);
        if (formErrors.length > 0) {
            console.log('Form validation errors:', formErrors);
            return res.status(400).json({
                message: 'Data formulir tidak valid',
                errors: formErrors
            });
        }
        
        // Validate files
        const fileErrors = validateFiles(files);
        if (fileErrors.length > 0) {
            console.log('File validation errors:', fileErrors);
            return res.status(400).json({
                message: 'File yang diunggah tidak valid',
                errors: fileErrors
            });
        }
        
        // Check for duplicate NIK
        const isDuplicate = await checkDuplicateNIK(formData.nik);
        if (isDuplicate) {
            console.log('Duplicate NIK detected:', formData.nik);
            return res.status(409).json({
                message: 'NIK sudah terdaftar dalam sistem',
                errors: ['NIK yang Anda masukkan sudah terdaftar. Silakan periksa kembali atau hubungi admin jika ini adalah kesalahan.']
            });
        }

        const auth = await getAuth();

        // Upload files to Drive and get links
        const fileLinks = {};
        for (const file of files) {
            const link = await uploadToDrive(file, auth);
            fileLinks[file.fieldname] = link;
        }

        // Append data to Google Sheet
        const doc = await getSpreadsheet();
        const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsByTitle['Sheet1'];

        const rowData = {
            ...formData,
            ...fileLinks,
            'Timestamp': new Date().toISOString(),
        };

        await sheet.addRow(rowData);

        console.log('Data successfully submitted to Google Sheets');
        res.status(200).send({ message: 'Data submitted successfully!' });
    } catch (error) {
        console.error('Error submitting data:', error);
        
        // Provide more specific error messages
        if (error.message.includes('PERMISSION_DENIED')) {
            res.status(500).json({ 
                message: 'Tidak dapat mengakses Google Sheets. Periksa konfigurasi akses.' 
            });
        } else if (error.message.includes('INVALID_ARGUMENT')) {
            res.status(500).json({ 
                message: 'Data yang dikirim tidak sesuai format yang diharapkan.' 
            });
        } else {
            res.status(500).json({ 
                message: 'Terjadi kesalahan server. Silakan coba lagi.', 
                error: process.env.NODE_ENV === 'development' ? error.message : undefined 
            });
        }
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});