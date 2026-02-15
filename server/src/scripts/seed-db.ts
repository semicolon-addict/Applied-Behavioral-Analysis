///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Questionnaire data extracted from ABA Assessment documents
// Outcome: PostgreSQL database populated with questionnaire templates, domains, and questions
// Short Description: Seeds the database with structured questionnaire data for ABLLS-R, AFLLS, DAYC-2, and Behavior Therapy assessments
/////////////////////////////////////////////////////////////

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type QuestionData = {
    questionText: string;
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
// Source: ABA Assessment_Doc/ABLLS/ABLS-R.pdf
// ============================================================
const abllsrTemplate: TemplateData = {
    assessmentType: 'ABLLS-R',
    title: 'ABLLS-R Assessment Questionnaire',
    description: 'Assessment of Basic Language and Learning Skills - Revised. Evaluates cooperation, visual performance, receptive language, motor imitation, and more.',
    domains: [
        {
            name: 'Cooperation & Reinforcer Effectiveness',
            questions: [
                { questionText: 'Takes a reinforcer from a familiar adult.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Eats/uses reinforcer appropriately.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Looks at, touches or points to a reinforcer offered.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Approaches adult to obtain reinforcer.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Sits in a chair for a brief period for reinforcer.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Waits without problem behavior for a promised reinforcer.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Makes eye contact with adult when anticipating reinforcer.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'Visual Performance',
            questions: [
                { questionText: 'Matches identical objects from an array of 3.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Matches identical pictures from an array of 3.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Matches object to picture from an array of 3.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Matches picture to object from an array of 3.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Sorts non-identical items into categories.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Completes a 3-piece inset puzzle.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Matches non-identical objects of the same class.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Matches associated pictures (e.g., cup and saucer).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Completes a simple ABAB sequencing pattern.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Seriates 3 items by size (smallest to largest).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Extends a simple pattern sequence.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Replicates a sequence of 3 items shown by instructor.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'Receptive Language',
            questions: [
                { questionText: 'Responds to own name by orienting towards speaker.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Follows a one-step instruction (e.g., "sit down").', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Touches named body parts on request.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Touches named objects from an array of 2.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Identifies objects in pictures when named.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Follows instructions with prepositions (e.g., "put block in cup").', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Selects items by feature (e.g., color).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Selects items by function (e.g., "which one do you write with?").', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Selects items by class (e.g., "find the animal").', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Follows two-step related commands.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Identifies actions in pictures.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Discriminates between pronouns ("my" and "your").', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Discriminates singular vs. plural nouns.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Follows instructions involving adjectives (e.g., "get the big ball").', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Identifies emotions in pictures.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'Motor Imitation',
            questions: [
                { questionText: 'Imitates gross motor movements (e.g., clapping hands).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates actions with objects (e.g., pushing a toy car).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates fine motor movements (e.g., pinching fingers).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates oral motor movements (e.g., opening mouth).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates a sequence of two motor actions.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates from a distance (across the room).', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates an action in a small group setting.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Copies a simple 2-block structure.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Copies a vertical line drawing.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates novel, previously unseen motor actions.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Imitates a 3-step sequence of motor actions.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Spontaneously imitates peer or adult without prompting.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Copies a complex 4-block design.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
    ],
};

// ============================================================
// AFLS Questionnaire Data
// Source: ABA Assessment_Doc/AFLS/*.pdf
// ============================================================
const aflsTemplate: TemplateData = {
    assessmentType: 'AFLLS',
    title: 'AFLS Assessment Questionnaire',
    description: 'Assessment of Functional Living Skills. Evaluates basic living, home, community participation, and school skills across multiple protocols.',
    domains: [
        {
            name: 'Basic Living Skills - Self Management',
            questions: [
                { questionText: 'Indicates need for toileting.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Manages clothing for toileting independently.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Uses toilet paper appropriately.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Washes hands with soap and water.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Dries hands after washing.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Covers mouth when coughing or sneezing.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Uses a tissue to blow nose.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Recognizes when clothing is dirty or wet.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'Basic Living Skills - Dressing',
            questions: [
                { questionText: 'Puts on and removes shoes independently.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Puts on socks correctly.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Puts on a pullover shirt independently.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Puts on pants/shorts independently.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Manages buttons and snaps.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Uses a zipper independently.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Selects weather-appropriate clothing.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Ties shoelaces independently.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'Basic Living Skills - Grooming',
            questions: [
                { questionText: 'Brushes teeth with toothpaste.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Brushes or combs hair appropriately.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Washes face independently.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Applies deodorant appropriately.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Maintains appropriate personal hygiene habits.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'Home Skills - Meals',
            questions: [
                { questionText: 'Uses utensils correctly to eat meals.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Pours liquid from a container into a glass.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Prepares a simple snack independently.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Uses a microwave to heat food.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Clears own place setting after eating.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Loads and unloads a dishwasher.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'Community Participation Skills',
            questions: [
                { questionText: 'Walks safely on sidewalks and crosswalks.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Identifies and follows community signs.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Behaves appropriately in public places.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Makes a purchase at a store with assistance.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Uses appropriate social greetings in public.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Waits in line patiently.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
        {
            name: 'School Skills',
            questions: [
                { questionText: 'Follows classroom rules and routines.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Transitions between activities with minimal support.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Raises hand to get attention or ask a question.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Stays on task for an age-appropriate duration.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Follows multi-step classroom instructions.', responseType: 'dropdown', options: abaScoreOptions },
                { questionText: 'Works cooperatively with peers on group activities.', responseType: 'dropdown', options: abaScoreOptions },
            ],
        },
    ],
};

// ============================================================
// DAYC-2 Questionnaire Data
// Source: ABA Assessment_Doc/DAYC-2/*.pdf, *.docx
// ============================================================
const dayc2Template: TemplateData = {
    assessmentType: 'DAYC-2',
    title: 'DAYC-2 Assessment Questionnaire',
    description: 'Developmental Assessment of Young Children - 2nd Edition. Evaluates cognitive, communication, social-emotional, physical, and adaptive behavior development.',
    domains: [
        {
            name: 'Cognitive Development',
            questions: [
                { questionText: 'Demonstrates object permanence (searches for hidden objects).', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Explores objects by mouthing, banging, and shaking.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Uses simple cause-and-effect toys appropriately.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Stacks 2 or more blocks.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Sorts objects by color or shape.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Identifies self in a mirror.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Engages in pretend play with toys.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Understands concept of "one" and "many".', responseType: 'dropdown', options: dayc2ScoreOptions },
            ],
        },
        {
            name: 'Communication',
            questions: [
                { questionText: 'Responds to sounds by turning head towards source.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Babbles using consonant-vowel combinations.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Uses gestures to communicate (pointing, waving).', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Says first meaningful words (e.g., "mama", "dada").', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Combines two words (e.g., "more juice").', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Follows simple verbal directions.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Names common objects when asked.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Uses 3-word sentences to express needs.', responseType: 'dropdown', options: dayc2ScoreOptions },
            ],
        },
        {
            name: 'Social-Emotional Development',
            questions: [
                { questionText: 'Shows attachment to primary caregiver.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Smiles in response to social interaction.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Shows interest in other children.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Expresses emotions appropriately (happy, sad, angry).', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Takes turns during simple play activities.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Shows empathy towards others in distress.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Plays cooperatively with other children.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Manages transitions between activities without distress.', responseType: 'dropdown', options: dayc2ScoreOptions },
            ],
        },
        {
            name: 'Physical Development',
            questions: [
                { questionText: 'Holds head steady when held upright.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Rolls over from back to front and front to back.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Sits without support.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Crawls on hands and knees.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Walks independently.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Climbs stairs with support.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Grasps small objects using pincer grasp.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Kicks a ball forward.', responseType: 'dropdown', options: dayc2ScoreOptions },
            ],
        },
        {
            name: 'Adaptive Behavior',
            questions: [
                { questionText: 'Drinks from a cup with minimal spilling.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Feeds self with a spoon.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Indicates when diaper is wet or dirty.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Attempts to wash hands with assistance.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Removes simple clothing items (hat, socks).', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Cooperates with dressing by extending arms/legs.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Follows simple safety rules with reminders.', responseType: 'dropdown', options: dayc2ScoreOptions },
                { questionText: 'Sleeps through the night consistently.', responseType: 'dropdown', options: dayc2ScoreOptions },
            ],
        },
    ],
};

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
// Seed function
// ============================================================
async function seed() {
    console.log('🌱 Starting database seed...');

    const allTemplates = [abllsrTemplate, aflsTemplate, dayc2Template, behaviorTherapyTemplate];

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
                                questionText: question.questionText,
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
