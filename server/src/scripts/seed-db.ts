///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Questionnaire data extracted from ABA Assessment documents
// Outcome: PostgreSQL database populated with questionnaire templates, domains, and questions
// Short Description: Seeds the database with structured questionnaire data for ABLLS-R, AFLLS, DAYC-2, and Behavior Therapy assessments
/////////////////////////////////////////////////////////////

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type QuestionData = {
    skillCode?: string;
    questionText: string;
    taskName?: string;
    taskObjective?: string;
    examples?: string;
    criteria?: string;
    scoreType?: string;
    responseType: string;
    options: string[];
};

type DomainData = {
    name: string;
    questions: QuestionData[];
};

type TemplateData = {
    assessmentType: string;
    title: string;
    description: string;
    domains: DomainData[];
};

// Standard ABA scoring options
const abaScoreOptions = [
    '1 - Not observed / Not present',
    '2 - Emerging / Prompted',
    '3 - Inconsistent / Partial',
    '4 - Consistent / Independent',
    '5 - Mastered / Generalized',
];

const dayc2ScoreOptions = [
    '1 - Unable to perform',
    '2 - Emerging skill',
    '3 - Developing',
    '4 - Age-appropriate',
];

const behaviorScoreOptions = [
    '1 - Never',
    '2 - Rarely',
    '3 - Sometimes',
    '4 - Often',
    '5 - Always',
];

// ============================================================
// ABLLS-R Questionnaire Data
// Source: Parsed from ABLLS-R HTML tables via parse-ablls-seed.js
// Loaded from: ABA Assessment_Doc/ABA Assessment/ABLLS/ablls-r-seed-data.json
// ============================================================
function loadABLLSRSeedData(): TemplateData {
    const seedDataPath = path.resolve(
        __dirname, '..', '..', '..', '..', 'ABA Assessment_Doc', 'ABA Assessment', 'ABLLS', 'ablls-r-seed-data.json'
    );
    console.log(`  Loading ABLLS-R seed data from: ${seedDataPath}`);
    const raw = fs.readFileSync(seedDataPath, 'utf-8');
    const data = JSON.parse(raw);
    return {
        assessmentType: data.assessmentType,
        title: data.title,
        description: data.description,
        domains: data.domains.map((domain: any) => ({
            name: domain.name,
            questions: domain.questions.map((q: any) => ({
                skillCode: q.skillCode,
                questionText: q.questionText,
                taskName: q.taskName || undefined,
                taskObjective: q.taskObjective || undefined,
                examples: q.examples || undefined,
                criteria: q.criteria || undefined,
                scoreType: q.scoreType || undefined,
                responseType: q.responseType || 'dropdown',
                options: q.options || [],
            })),
        })),
    };
}

const abllsrTemplate: TemplateData = loadABLLSRSeedData();

// ============================================================
// AFLS Questionnaire Data
// Source: Parsed from AFLS HTML tables via parse_afls_tables.py
// Loaded from: ABA Assessment_Doc/ABA Assessment/AFLS/afls-seed-data.json
// ============================================================
function loadAFLSSeedData(): TemplateData {
    const seedDataPath = path.resolve(
        __dirname, '..', '..', '..', '..', 'ABA Assessment_Doc', 'ABA Assessment', 'AFLS', 'afls-seed-data.json'
    );
    console.log(`  Loading AFLS seed data from: ${seedDataPath}`);
    const raw = fs.readFileSync(seedDataPath, 'utf-8');
    const data = JSON.parse(raw);
    return {
        assessmentType: data.assessmentType,
        title: data.title,
        description: data.description,
        domains: data.domains.map((domain: any) => ({
            name: domain.name,
            questions: domain.questions.map((q: any) => ({
                skillCode: q.skillCode,
                questionText: q.questionText,
                taskName: q.taskName || undefined,
                taskObjective: q.taskObjective || undefined,
                examples: q.examples || undefined,
                criteria: q.criteria || undefined,
                scoreType: q.scoreType || undefined,
                responseType: q.responseType || 'dropdown',
                options: q.options || [],
            })),
        })),
    };
}

const aflsTemplate: TemplateData = loadAFLSSeedData();

// ============================================================
// DAYC-2 Questionnaire Data
// Source: Parsed from DAYC-2 PDFs via parse_dayc2.py
// Loaded from: ABA Assessment_Doc/ABA Assessment/DAYC-2/dayc2-seed-data.json
// ============================================================
function loadDAYC2SeedData(): TemplateData {
    const seedDataPath = path.resolve(
        __dirname, '..', '..', '..', '..', 'ABA Assessment_Doc', 'ABA Assessment', 'DAYC-2', 'dayc2-seed-data.json'
    );
    console.log(`  Loading DAYC-2 seed data from: ${seedDataPath}`);
    const raw = fs.readFileSync(seedDataPath, 'utf-8');
    const data = JSON.parse(raw);
    return {
        assessmentType: data.assessmentType,
        title: data.title,
        description: data.description,
        domains: data.domains.map((domain: any) => ({
            name: domain.name,
            questions: domain.questions.map((q: any) => ({
                skillCode: q.skillCode,
                questionText: q.questionText,
                taskName: q.taskName || undefined,
                taskObjective: q.taskObjective || undefined,
                examples: q.examples || undefined,
                criteria: q.criteria || undefined,
                scoreType: q.scoreType || undefined,
                responseType: q.responseType || 'dropdown',
                options: q.options || [],
            })),
        })),
    };
}

const dayc2Template: TemplateData = loadDAYC2SeedData();

// ============================================================
// Behavior Therapy Questionnaire Data
// Source: ABA Assessment_Doc/Respect Behavior Therapy Assessment Template/*.docx
// ============================================================
const behaviorTherapyTemplate: TemplateData = {
    assessmentType: 'Behavior-Therapy',
    title: 'Behavior Therapy Assessment Questionnaire',
    description: 'Comprehensive behavioral assessment covering functional behavior, intervention planning, school behavior, and therapy progress tracking.',
    domains: [
        {
            name: 'Functional Behavior Assessment',
            questions: [
                { questionText: 'Identifies the primary function of the target behavior (attention, escape, access, sensory).', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Demonstrates the target behavior during structured activities.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Demonstrates the target behavior during unstructured activities.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Engages in self-stimulatory behaviors.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Exhibits aggressive behaviors towards others.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Exhibits self-injurious behaviors.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Engages in property destruction.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Displays elopement or running away behaviors.', responseType: 'dropdown', options: behaviorScoreOptions },
            ],
        },
        {
            name: 'Behavior Intervention Strategies',
            questions: [
                { questionText: 'Responds positively to positive reinforcement strategies.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Accepts redirection when engaging in maladaptive behavior.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Uses replacement behaviors when prompted.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Tolerates delay of reinforcement.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Responds to visual supports and schedules.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Follows a token economy or reward system.', responseType: 'dropdown', options: behaviorScoreOptions },
            ],
        },
        {
            name: 'School Behavior Plan',
            questions: [
                { questionText: 'Follows classroom rules with minimal prompting.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Transitions between school activities appropriately.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Interacts appropriately with peers during recess.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Stays seated during instruction time.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Completes assigned tasks within expected timeframe.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Responds appropriately to teacher instructions.', responseType: 'dropdown', options: behaviorScoreOptions },
            ],
        },
        {
            name: 'Therapy Progress Indicators',
            questions: [
                { questionText: 'Shows reduction in frequency of target behavior over time.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Demonstrates increased use of appropriate communication.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Shows improvement in social interactions.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Generalizes learned skills across settings.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Maintains acquired skills over time.', responseType: 'dropdown', options: behaviorScoreOptions },
                { questionText: 'Parent/caregiver reports improvement at home.', responseType: 'dropdown', options: behaviorScoreOptions },
            ],
        },
    ],
};

// ============================================================
// VB-MAPP Questionnaire Data
// Source: Parsed from VB-MAPP scoring tool via parse_vbmapp.js
// Loaded from: ABA Assessment_Doc/ABA Assessment/VB-MAPP/vbmapp-seed-data.json
// ============================================================
function loadVBMAPPSeedData(): TemplateData {
    const seedDataPath = path.resolve(
        __dirname, '..', '..', '..', '..', 'ABA Assessment_Doc', 'ABA Assessment', 'VB-MAPP', 'vbmapp-seed-data.json'
    );
    console.log(`  Loading VB-MAPP seed data from: ${seedDataPath}`);
    const raw = fs.readFileSync(seedDataPath, 'utf-8');
    const data = JSON.parse(raw);
    return {
        assessmentType: data.assessmentType,
        title: data.title,
        description: data.description,
        domains: data.domains.map((domain: any) => ({
            name: domain.name,
            questions: domain.questions.map((q: any) => ({
                skillCode: q.skillCode,
                questionText: q.questionText,
                taskName: q.taskName || undefined,
                taskObjective: q.taskObjective || undefined,
                examples: q.examples || undefined,
                criteria: q.criteria || undefined,
                scoreType: q.scoreType || undefined,
                responseType: q.responseType || 'dropdown',
                options: q.options || [],
            })),
        })),
    };
}

const vbmappTemplate: TemplateData = loadVBMAPPSeedData();

function buildFallbackSkillCode(assessmentType: string, domainIndex: number, questionIndex: number): string {
    if (assessmentType === 'ABLLS-R') {
        const domainLetter = String.fromCharCode(65 + domainIndex);
        return `${domainLetter}${questionIndex + 1}`;
    }

    if (assessmentType === 'Behavior-Therapy') {
        return `BT-${domainIndex + 1}-${questionIndex + 1}`;
    }

    return `${assessmentType}-${domainIndex + 1}-${questionIndex + 1}`;
}

// ============================================================
// Seed function
// ============================================================
async function seed() {
    console.log('🌱 Starting database seed...');

    const allTemplates = [abllsrTemplate, aflsTemplate, dayc2Template, behaviorTherapyTemplate, vbmappTemplate];

    for (const templateData of allTemplates) {
        console.log(`\n📋 Seeding: ${templateData.title}`);

        // Delete existing template if it exists (for re-seeding)
        await prisma.questionnaireTemplate.deleteMany({
            where: { assessmentType: templateData.assessmentType },
        });

        // Create the template with nested domains and questions
        const template = await prisma.questionnaireTemplate.create({
            data: {
                assessmentType: templateData.assessmentType,
                title: templateData.title,
                description: templateData.description,
                domains: {
                    create: templateData.domains.map((domain, domainIndex) => ({
                        name: domain.name,
                        sortOrder: domainIndex,
                        questions: {
                            create: domain.questions.map((question, questionIndex) => ({
                                skillCode: question.skillCode || buildFallbackSkillCode(templateData.assessmentType, domainIndex, questionIndex),
                                questionText: question.questionText,
                                taskName: question.taskName || null,
                                taskObjective: question.taskObjective || null,
                                examples: question.examples || null,
                                criteria: question.criteria || null,
                                scoreType: question.scoreType || null,
                                responseType: question.responseType,
                                options: question.options,
                                sortOrder: questionIndex,
                            })),
                        },
                    })),
                },
            },
            include: {
                domains: {
                    include: {
                        _count: { select: { questions: true } },
                    },
                },
            },
        });

        const totalQuestions = template.domains.reduce((acc, d) => acc + d._count.questions, 0);
        console.log(`   ✅ Created "${template.title}" with ${template.domains.length} domains, ${totalQuestions} questions`);
    }

    console.log('\n🎉 Database seeded successfully!');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
