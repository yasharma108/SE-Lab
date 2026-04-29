const fs = require('fs');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

async function extractFiles() {
    let combinedText = '';

    // Extract SRS pdf
    try {
        if (fs.existsSync('tmp_SRS.pdf')) {
            const dataBuffer = fs.readFileSync('tmp_SRS.pdf');
            const data = await pdf(dataBuffer);
            combinedText += "=== SRS_FieldSense.pdf ===\n";
            combinedText += data.text + "\n\n";
        }
    } catch (e) {
        console.error('Error reading pdf:', e);
    }

    const docxFiles = [
        'tmp_Report.docx',
        'tmp_FieldSense.docx',
        'tmp_UseCase.docx'
    ];

    for (const file of docxFiles) {
        try {
            if (fs.existsSync(file)) {
                const result = await mammoth.extractRawText({ path: file });
                combinedText += `=== ${file} ===\n`;
                combinedText += result.value + "\n\n";
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e);
        }
    }

    fs.writeFileSync('extracted_requirements.txt', combinedText);
    console.log('Extraction complete.');
}

extractFiles();
