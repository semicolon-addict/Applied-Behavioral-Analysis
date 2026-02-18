///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: VB Grading Result object with domain scores and child details
// Outcome: Formatted Excel workbook (.xlsx) with summary, domain scores, and detailed responses
// Short Description: Generates ABLLS assessment Excel report with red-themed styling using ExcelJS
/////////////////////////////////////////////////////////////

import ExcelJS from 'exceljs';
import { VBGradingResult } from './scoring-service';
import { mapQuestionToVB, renderVBBar } from './vb-mapping-service';

/**
 * Generate ABLLS assessment Excel report
 */
export async function generateABLLSExcel(gradingResult: VBGradingResult): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = 'ABLLS Assessment System';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // ========================================
    // Sheet 1: Summary
    // ========================================
    const summarySheet = workbook.addWorksheet('Summary', {
        pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    summarySheet.columns = [
        { width: 25 },
        { width: 40 }
    ];

    // Title
    const titleRow = summarySheet.addRow(['ABLLS Assessment Report']);
    titleRow.font = { size: 18, bold: true, color: { argb: 'FFDC143C' } }; // Red title
    titleRow.height = 30;
    summarySheet.mergeCells('A1:B1');
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

    summarySheet.addRow([]); // Blank row

    // Child Information
    summarySheet.addRow(['Child Information', '']);
    const childHeaderRow = summarySheet.getRow(3);
    childHeaderRow.font = { size: 14, bold: true, color: { argb: 'FFC13018' } };
    summarySheet.mergeCells('A3:B3');

    summarySheet.addRow(['Child Name:', gradingResult.childName || 'N/A']);
    summarySheet.addRow(['Child ID:', gradingResult.childId]);
    summarySheet.addRow(['Assessment Type:', gradingResult.assessmentType]);
    summarySheet.addRow(['Completed Date:', gradingResult.completedAt.toLocaleDateString()]);
    summarySheet.addRow(['Session ID:', gradingResult.sessionId]);

    summarySheet.addRow([]); // Blank row

    // Overall Score Summary
    summarySheet.addRow(['Overall Score Summary', '']);
    const scoreHeaderRow = summarySheet.getRow(10);
    scoreHeaderRow.font = { size: 14, bold: true, color: { argb: 'FFC13018' } };
    summarySheet.mergeCells('A10:B10');

    summarySheet.addRow(['Total Raw Score:', `${gradingResult.overallScore} / ${gradingResult.overallMaxPossible}`]);
    summarySheet.addRow(['Overall Percentage:', `${gradingResult.overallPercentage}%`]);
    summarySheet.addRow(['Overall Proficiency:', gradingResult.overallProficiency]);

    // Style the data rows
    for (let i = 4; i <= summarySheet.rowCount; i++) {
        const row = summarySheet.getRow(i);
        row.height = 20;
        
        const cellA = row.getCell(1);
        const cellB = row.getCell(2);
        
        cellA.font = { bold: true };
        cellA.alignment = { vertical: 'middle' };
        cellB.alignment = { vertical: 'middle' };
        
        if (i === 11 || i === 12 || i === 13) {
            cellA.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFADBD8' } // Light red background
            };
            cellB.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFADBD8' }
            };
        }
    }

    // ========================================
    // Sheet 2: Domain Scores
    // ========================================
    const scoresSheet = workbook.addWorksheet('Domain Scores', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Set column widths
    scoresSheet.columns = [
        { header: 'Domain', key: 'domain', width: 12 },
        { header: 'Domain Name', key: 'domainName', width: 40 },
        { header: 'Question Count', key: 'questionCount', width: 15 },
        { header: 'Raw Score', key: 'rawScore', width: 12 },
        { header: 'Max Possible', key: 'maxPossible', width: 15 },
        { header: 'Percentage', key: 'percentage', width: 12 },
        { header: 'Proficiency Level', key: 'proficiency', width: 18 },
    ];

    // Style header row
    const headerRow = scoresSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC143C' } // Red header
    };
    headerRow.height = 25;
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add domain data
    gradingResult.domainScores.forEach((domainScore, index) => {
        const row = scoresSheet.addRow({
            domain: domainScore.domain,
            domainName: domainScore.domainName,
            questionCount: domainScore.questionCount,
            rawScore: domainScore.rawScore,
            maxPossible: domainScore.maxPossible,
            percentage: `${domainScore.percentage}%`,
            proficiency: domainScore.proficiency,
        });

        row.height = 20;
        row.alignment = { vertical: 'middle' };

        // Alternate row colors
        if (index % 2 === 0) {
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFF5F5' } // Very light red
            };
        }

        // Color proficiency cell based on level
        const proficiencyCell = row.getCell('proficiency');
        proficiencyCell.font = { bold: true };
        
        switch (domainScore.proficiency) {
            case 'Mastered':
                proficiencyCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF90EE90' } // Light green
                };
                break;
            case 'Proficient':
                proficiencyCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFEB3B' } // Yellow
                };
                break;
            case 'Developing':
                proficiencyCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFA726' } // Orange
                };
                break;
            case 'Emerging':
                proficiencyCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFCDD2' } // Light red
                };
                break;
        }

        // Add borders
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // Add borders to header
    headerRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' },
        };
    });

    // ========================================
    // Sheet 3: Detailed Responses
    // ========================================
    const detailsSheet = workbook.addWorksheet('Detailed Responses', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Set column widths
    detailsSheet.columns = [
        { header: 'Domain', key: 'domain', width: 10 },
        { header: 'Skill Code', key: 'skillCode', width: 12 },
        { header: 'Task Name', key: 'taskName', width: 35 },
        { header: 'Question', key: 'question', width: 50 },
        { header: 'Selected Answer', key: 'answer', width: 40 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Max Score', key: 'maxScore', width: 12 },
        { header: 'Normalized (4u)', key: 'normalizedScore', width: 16 },
        { header: 'VB Bar', key: 'vbBar', width: 18 },
    ];

    // Style header row
    const detailsHeaderRow = detailsSheet.getRow(1);
    detailsHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    detailsHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC143C' } // Red header
    };
    detailsHeaderRow.height = 25;
    detailsHeaderRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Add detailed responses grouped by domain
    let currentDomainColor: string | null = null;
    let colorIndex = 0;
    const domainColors = ['FFFFF5F5', 'FFFFFFFF']; // Alternate between light red and white

    gradingResult.domainScores.forEach((domainScore) => {
        currentDomainColor = domainColors[colorIndex % domainColors.length];
        colorIndex++;

        domainScore.questions.forEach((questionResponse) => {
            const row = detailsSheet.addRow({
                domain: domainScore.domain,
                skillCode: questionResponse.skillCode,
                taskName: questionResponse.taskName,
                question: questionResponse.questionText,
                answer: questionResponse.selectedAnswer,
                score: questionResponse.numericScore,
                maxScore: questionResponse.maxScore,
                normalizedScore: questionResponse.normalizedScore,
                vbBar: questionResponse.vbBar,
            });

            row.height = 30;
            row.alignment = { vertical: 'middle', wrapText: true };

            // Apply domain color
            if (currentDomainColor) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: currentDomainColor }
                };
            }

            // Add borders
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });
    });

    // Add borders to header
    detailsHeaderRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' },
        };
    });

    // ========================================
    // Sheet 4: VB Mapping (4-unit normalized)
    // ========================================
    const vbSheet = workbook.addWorksheet('VB Mapping', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    vbSheet.columns = [
        { header: 'Question', key: 'question', width: 14 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Max', key: 'max', width: 8 },
        { header: 'Normalized', key: 'normalized', width: 12 },
        { header: 'Unit 1', key: 'u1', width: 8 },
        { header: 'Unit 2', key: 'u2', width: 8 },
        { header: 'Unit 3', key: 'u3', width: 8 },
        { header: 'Unit 4', key: 'u4', width: 8 },
        { header: 'Bar', key: 'bar', width: 18 },
    ];

    const vbHeaderRow = vbSheet.getRow(1);
    vbHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    vbHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC143C' }
    };
    vbHeaderRow.height = 24;
    vbHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

    const filledFill = (argb: string) => ({
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb }
    });
    const vbFilled = filledFill('FFC95A5A');
    const vbEmpty = filledFill('FFFFFFFF');

    gradingResult.vbExport.forEach((vbRow) => {
        const mapped = mapQuestionToVB(vbRow.question, vbRow.score, vbRow.max);
        const row = vbSheet.addRow({
            question: vbRow.question,
            score: vbRow.score,
            max: vbRow.max,
            normalized: vbRow.normalized,
            bar: renderVBBar(mapped.filledMap),
        });

        row.height = 20;
        row.alignment = { vertical: 'middle', horizontal: 'center' };

        const rowNumber = row.number;

        if (vbRow.max === 2) {
            vbSheet.mergeCells(`E${rowNumber}:F${rowNumber}`);
            vbSheet.mergeCells(`G${rowNumber}:H${rowNumber}`);

            const block1 = vbSheet.getCell(`E${rowNumber}`);
            const block2 = vbSheet.getCell(`G${rowNumber}`);
            block1.fill = mapped.pairedFillMap[0] ? vbFilled : vbEmpty;
            block2.fill = mapped.pairedFillMap[1] ? vbFilled : vbEmpty;
        } else {
            for (let i = 0; i < 4; i++) {
                const cell = vbSheet.getCell(rowNumber, 5 + i);
                cell.fill = mapped.filledMap[i] ? vbFilled : vbEmpty;
            }
        }

        for (let col = 1; col <= 9; col++) {
            const cell = vbSheet.getCell(rowNumber, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        }
    });

    vbHeaderRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'medium' },
            left: { style: 'medium' },
            bottom: { style: 'medium' },
            right: { style: 'medium' },
        };
    });

    return workbook;
}
