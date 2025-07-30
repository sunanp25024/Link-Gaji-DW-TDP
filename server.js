const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis');
const stream = require('stream');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

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
// For local development, use credentials.json
let credentials;
if (process.env.NODE_ENV === 'production') {
    credentials = {
        type: "service_account",
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
        universe_domain: "googleapis.com"
    };
} else {
    credentials = require('./credentials.json');
}
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

app.post('/submit', upload.any(), async (req, res) => {
    try {
        const formData = req.body;
        const files = req.files;

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

        res.status(200).send({ message: 'Data submitted successfully!' });
    } catch (error) {
        console.error('Error submitting data:', error);
        res.status(500).send({ message: 'Error submitting data.', error: error.message });
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});