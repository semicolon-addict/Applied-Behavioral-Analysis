///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Source assessment artifacts under ABA Assessment_Doc/*
// Outcome: Validates that expected parsed seed files exist and are readable
// Short Description: Lightweight parser entrypoint placeholder used by npm run parse
/////////////////////////////////////////////////////////////

import * as fs from 'fs';
import * as path from 'path';

type CheckTarget = {
    label: string;
    filePath: string;
};

const root = path.resolve(__dirname, '..', '..', '..', '..');

const checks: CheckTarget[] = [
    {
        label: 'AFLS seed data',
        filePath: path.join(root, 'ABA Assessment_Doc', 'ABA Assessment', 'AFLS', 'afls-seed-data.json'),
    },
    {
        label: 'DAYC-2 seed data',
        filePath: path.join(root, 'ABA Assessment_Doc', 'ABA Assessment', 'DAYC-2', 'dayc2-seed-data.json'),
    },
];

function ensureJsonReadable(target: CheckTarget): void {
    if (!fs.existsSync(target.filePath)) {
        throw new Error(`Missing ${target.label}: ${target.filePath}`);
    }

    const raw = fs.readFileSync(target.filePath, 'utf-8');
    JSON.parse(raw);
    console.log(`OK: ${target.label}`);
}

function main(): void {
    console.log('Validating parsed assessment artifacts...');
    checks.forEach(ensureJsonReadable);
    console.log('Validation complete. Parsed assessment files are available.');
}

main();
