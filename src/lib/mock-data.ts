
import type { User, Child, Assessment, Message, Domain, AfllsProtocol, Questionnaire } from '@/types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Dr. Evelyn Reed', email: 'e.reed@clinic.com', role: 'Clinician', avatar: 'https://picsum.photos/seed/avatar1/100/100', status: 'Active' },
  { id: 'user-2', name: 'Mark Johnson', email: 'm.johnson@example.com', role: 'Parent', avatar: 'https://picsum.photos/seed/avatar2/100/100', status: 'Active' },
  { id: 'user-3', name: 'Admin User', email: 'admin@behaveasses.com', role: 'Admin', avatar: 'https://picsum.photos/seed/avatar3/100/100', status: 'Active' },
  { id: 'user-4', name: 'Dr. Samuel Green', email: 's.green@clinic.com', role: 'Clinician', avatar: 'https://picsum.photos/seed/avatar4/100/100', status: 'Active' },
  { id: 'user-5', name: 'Laura Williams', email: 'l.williams@example.com', role: 'Parent', avatar: 'https://picsum.photos/seed/avatar5/100/100', status: 'Pending' },
  { id: 'user-6', name: 'David Smith', email: 'd.smith@clinic.com', role: 'Clinician', avatar: 'https://picsum.photos/seed/avatar6/100/100', status: 'Inactive' },
];

export const mockChildren: Child[] = [
  { id: 'child-1', name: 'Leo Johnson', dob: '2018-05-10', diagnosis: 'Autism Spectrum Disorder', parentId: 'user-2', clinicianId: 'user-1' },
  { id: 'child-2', name: 'Mia Williams', dob: '2019-02-15', diagnosis: 'Developmental Delay', parentId: 'user-5', clinicianId: 'user-4' },
  { id: 'child-3', name: 'Noah Brown', dob: '2017-11-20', diagnosis: 'ADHD', parentId: 'user-2', clinicianId: 'user-1' },
];

export const mockQuestionnaires: Questionnaire[] = [];

const generateScores = (domains: Domain[] | AfllsProtocol[]) => {
  const scores: any[] = [];
  
  const processDomains = (domainList: Domain[]) => {
      domainList.forEach(domain => {
          domain.tasks.forEach(task => {
              scores.push({
                  domain: domain.name,
                  task: task.name,
                  score: Math.floor(Math.random() * 11), // Random score 0-10
              });
          });
      });
  };

  if (domains.length > 0 && 'protocolName' in domains[0]) {
      (domains as AfllsProtocol[]).forEach(protocol => {
          processDomains(protocol.domains);
      });
  } else {
      processDomains(domains as Domain[]);
  }

  return scores;
};

export const abllsDomains: Domain[] = [
    { 
        name: 'Cooperation & Reinforcer', 
        tasks: [
            { name: 'A1', question: 'Takes a reinforcer from a familiar adult.', objective: 'Child will accept a preferred edible or tangible item from an adult.' },
            { name: 'A2', question: 'Eats/uses reinforcer.', objective: 'Child will consume the edible reinforcer or appropriately interact with the tangible reinforcer.' },
            { name: 'A3', question: 'Looks at, touches or points to a reinforcer offered.', objective: 'When presented with a reinforcer, the child will orient towards and make physical contact.' },
            { name: 'A4', question: 'Approaches adult.', objective: 'Child will willingly move towards a familiar adult to obtain a reinforcer.' },
            { name: 'A5', question: 'Sits for reinforcer.', objective: 'Child will sit in a chair for a brief period to receive a reinforcer.' },
            { name: 'A6', question: 'Waits for reinforcer.', objective: 'Child will wait without problem behavior for a few seconds for a promised reinforcer.' },
            { name: 'A7', question: 'Looks at adult for reinforcer.', objective: 'Child will make eye contact with the adult when anticipating a reinforcer.' }
        ]
    },
    { 
        name: 'Visual Performance', 
        tasks: [
            { name: 'B1', question: 'Matches identical objects.', objective: 'When given an object, the child will find the identical match from an array of 3.' },
            { name: 'B2', question: 'Matches identical pictures.', objective: 'When given a picture, the child will find the identical match from an array of 3.' },
            { name: 'B3', question: 'Matches object to picture.', objective: 'When given an object, the child will find the matching picture from an array of 3.' },
            { name: 'B4', question: 'Matches picture to object.', objective: 'When given a picture, the child will find the matching object from an array of 3.' },
            { name: 'B5', question: 'Sorts non-identical items.', objective: 'Child can sort a group of items into categories (e.g., animals vs. vehicles).' },
            { name: 'B6', question: 'Completes simple puzzles.', objective: 'Child can complete a 3-piece inset puzzle.' },
            { name: 'B7', question: 'Matches non-identical objects.', objective: 'Child can match items that are different but belong to the same class (e.g., two different toy cars).' },
            { name: 'B8', question: 'Matches associated pictures.', objective: 'Child can match pictures that are commonly associated (e.g., cup and saucer).' },
            { name: 'B9', question: 'Completes sequencing patterns.', objective: 'Child can complete a simple ABAB pattern.' },
            { name: 'B10', question: 'Seriates by size.', objective: 'Child can arrange 3 items in order from smallest to largest.' },
            { name: 'B11', question: 'Extends a sequence pattern.', objective: 'Child can continue a simple ABAB pattern.' },
            { name: 'B12', question: 'Matches items in a sequence.', objective: 'Child can replicate a sequence of 3 items shown by the instructor.' }
        ]
    },
    { 
        name: 'Receptive Language', 
        tasks: [
            { name: 'C1', question: 'Responds to own name.', objective: 'Child will orient towards the speaker when their name is called.' },
            { name: 'C2', question: 'Follows simple instructions.', objective: 'Child will follow a one-step instruction (e.g., "sit down").' },
            { name: 'C3', question: 'Touches body parts.', objective: 'When asked "touch your nose", child will touch their nose.' },
            { name: 'C4', question: 'Touches objects.', objective: 'When asked "touch the ball", child will touch the ball from an array of 2.' },
            { name: 'C5', question: 'Identifies objects in pictures.', objective: 'When asked "show me the cat", child will point to the picture of a cat.' },
            { name: 'C6', question: 'Follows instructions with prepositions.', objective: 'Child will follow an instruction involving a preposition (e.g., "put the block in the cup").' },
            { name: 'C7', question: 'Selects items by feature.', objective: 'When asked "give me the red one", child will select the red item.' },
            { name: 'C8', question: 'Selects items by function.', objective: 'When asked "which one do you write with?", child will select the pencil.' },
            { name: 'C9', question: 'Selects items by class.', objective: 'When asked "find the animal", child will select the animal from an array.' },
            { name: 'C10', question: 'Follows two-step instructions.', objective: 'Child will follow a two-step related command (e.g., "get your shoes and bring them to me").' },
            { name: 'C11', question: 'Identifies actions in pictures.', objective: 'When asked "who is sleeping?", child points to the picture of someone sleeping.' },
            { name: 'C12', question: 'Discriminates between pronouns.', objective: 'Child can follow instructions involving "my" and "your".' },
            { name: 'C13', question: 'Discriminates singular vs. plural.', objective: 'Child can differentiate between "block" and "blocks".' },
            { name: 'C14', question: 'Follows instructions involving adjectives.', objective: 'Child can follow a command like "get the big ball".' },
            { name: 'C15', 'question': 'Identifies emotions.', 'objective': 'Child can point to a picture of a happy face when asked "who is happy?".' }
        ]
    },
    { 
        name: 'Motor Imitation', 
        tasks: [
             { name: 'D1', question: 'Imitates gross motor movements.', objective: 'Child will imitate a simple gross motor action (e.g., clapping hands) after an adult model.' },
             { name: 'D2', question: 'Imitates actions with objects.', objective: 'Child will imitate an action with an object (e.g., pushing a toy car).' },
             { name: 'D3', question: 'Imitates fine motor movements.', objective: 'Child will imitate a simple fine motor action (e.g., pinching fingers together).' },
             { name: 'D4', question: 'Imitates oral motor movements.', objective: 'Child will imitate opening their mouth when an adult models the action.' },
             { name: 'D5', question: 'Imitates a sequence of two motor actions.', objective: 'Child imitates two actions in a sequence (e.g., tap table then clap hands).' },
             { name: 'D6', question: 'Imitates from a distance.', objective: 'Child imitates a model from across the room.' },
             { name: 'D7', question: 'Imitates in a group.', objective: 'Child imitates an action in a small group setting.' },
             { name: 'D8', question: 'Copies block structures.', objective: 'Child can copy a simple 2-block structure.' },
             { name: 'D9', question: 'Copies a drawing.', objective: 'Child can copy a vertical line.' },
             { name: 'D10', question: 'Imitates novel actions.', objective: 'Child will imitate a new, previously unseen motor action.' },
             { name: 'D11', question: 'Imitates a 3-step sequence.', objective: 'Child imitates a sequence of three motor actions.' },
             { name: 'D12', question: 'Spontaneous imitation.', objective: 'Child spontaneously imitates an action of a peer or adult without being prompted.' },
             { name: 'D13', 'question': 'Copies complex patterns.', 'objective': 'Child can copy a 4-block design.' }
        ]
    },
];

export const afllsProtocols: AfllsProtocol[] = [
  {
    protocolName: 'Basic Living Skills',
    domains: [
        { name: 'Self Management', tasks: Array.from({length: 25}, (_, i) => ({ name: `SM${i+1}`, question: `Question for Self Management Task SM${i+1}`, objective: `Objective for Self Management Task SM${i+1}`})) },
        { name: 'Basic Communication', tasks: Array.from({length: 22}, (_, i) => ({ name: `BC${i+1}`, question: `Question for Basic Communication Task BC${i+1}`, objective: `Objective for Basic Communication Task BC${i+1}`})) },
        { name: 'Dressing', tasks: Array.from({length: 38}, (_, i) => ({ name: `DR${i+1}`, question: `Question for Dressing Task DR${i+1}`, objective: `Objective for Dressing Task DR${i+1}`})) },
        { name: 'Toileting', tasks: Array.from({length: 41}, (_, i) => ({ name: `TL${i+1}`, question: `Question for Toileting Task TL${i+1}`, objective: `Objective for Toileting Task TL${i+1}`})) },
        { name: 'Grooming', tasks: Array.from({length: 34}, (_, i) => ({ name: `GR${i+1}`, question: `Question for Grooming Task GR${i+1}`, objective: `Objective for Grooming Task GR${i+1}`})) },
        { name: 'Bathing', tasks: Array.from({length: 13}, (_, i) => ({ name: `BT${i+1}`, question: `Question for Bathing Task BT${i+1}`, objective: `Objective for Bathing Task BT${i+1}`})) },
        { name: 'Health, Safety and First Aid', tasks: Array.from({length: 39}, (_, i) => ({ name: `HS${i+1}`, question: `Question for Health & Safety Task HS${i+1}`, objective: `Objective for Health & Safety Task HS${i+1}`})) },
        { name: 'Nighttime Routines', tasks: Array.from({length: 14}, (_, i) => ({ name: `NR${i+1}`, question: `Question for Nighttime Routines Task NR${i+1}`, objective: `Objective for Nighttime Routines Task NR${i+1}`})) },
    ]
  },
  {
    protocolName: 'Home Skills',
    domains: [
        { 
            name: 'Meals at Home', 
            tasks: Array.from({length: 20}, (_, i) => ({ name: `HS${i+1}`, question: `Question for Home Skills Task HS${i+1}`, objective: `Objective for Home Skills Task HS${i+1}`})) 
        },
        { 
            name: 'Dishes', 
            tasks: Array.from({length: 10}, (_, i) => ({ name: `HS${i+21}`, question: `Question for Home Skills Task HS${i+21}`, objective: `Objective for Home Skills Task HS${i+21}`})) 
        },
    ]
  },
  {
    protocolName: 'Community Participation Skills',
    domains: [
        { 
            name: 'Basic Mobility', 
            tasks: Array.from({length: 15}, (_, i) => ({ name: `CPS${i+1}`, question: `Question for Community Skills Task CPS${i+1}`, objective: `Objective for Community Skills Task CPS${i+1}`}))
        },
        { 
            name: 'Shopping', 
            tasks: Array.from({length: 25}, (_, i) => ({ name: `CPS${i+16}`, question: `Question for Community Skills Task CPS${i+16}`, objective: `Objective for Community Skills Task CPS${i+16}`}))
        },
    ]
  },
  {
    protocolName: 'School Skills',
    domains: [
        { 
            name: 'Classroom Mechanics', 
            tasks: Array.from({length: 20}, (_, i) => ({ name: `SS${i+1}`, question: `Question for School Skills Task SS${i+1}`, objective: `Objective for School Skills Task SS${i+1}`}))
        },
        { 
            name: 'Routines and Expectations', 
            tasks: Array.from({length: 15}, (_, i) => ({ name: `SS${i+21}`, question: `Question for School Skills Task SS${i+21}`, objective: `Objective for School Skills Task SS${i+21}`}))
        },
    ]
  }
];


export const dayc2Domains: Domain[] = [
    { name: 'Cognitive', tasks: Array.from({length: 8}, (_, i) => ({ name: `T${i+1}`, question: `Question for Cognitive Task ${i+1}`, objective: `Objective for Cognitive Task ${i+1}`})) },
    { name: 'Communication', tasks: Array.from({length: 8}, (_, i) => ({ name: `T${i+1}`, question: `Question for Communication Task ${i+1}`, objective: `Objective for Communication Task ${i+1}`})) },
    { name: 'Social-Emotional', tasks: Array.from({length: 8}, (_, i) => ({ name: `T${i+1}`, question: `Question for SE Task ${i+1}`, objective: `Objective for SE Task ${i+1}`})) },
];

export const mockAssessments: Assessment[] = [
  { id: 'assess-1', childId: 'child-1', type: 'ABLLS-R', date: '2023-10-26', scores: generateScores(abllsDomains), progress: 75 },
  { id: 'assess-2', childId: 'child-1', type: 'AFLLS', date: '2023-11-05', scores: generateScores(afllsProtocols), progress: 60 },
  { id: 'assess-3', childId: 'child-2', type: 'DAYC-2', date: '2023-11-10', scores: generateScores(dayc2Domains), progress: 45 },
  { id: 'assess-4', childId: 'child-3', type: 'ABLLS-R', date: '2023-11-12', scores: generateScores(abllsDomains), progress: 90 },
];

export const mockMessages: Message[] = [
    { id: 'msg-1', from: 'user-1', to: 'user-2', subject: 'Update on Leo\'s progress', body: 'Hi Mark, Leo did wonderfully in his session today. We saw great improvement in the Receptive Language domain. Let\'s discuss more in our next call.', timestamp: '2023-11-15T14:30:00Z', read: false },
    { id: 'msg-2', from: 'user-2', to: 'user-1', subject: 'Re: Update on Leo\'s progress', body: 'That\'s fantastic news, Dr. Reed! Thank you for the update. Looking forward to our call.', timestamp: '2023-11-15T16:00:00Z', read: true },
];

export const analyticsData = {
  averageScores: [
    { name: 'Cooperation', 'ABLLS-R': 7, 'AFLLS': 0, 'DAYC-2': 0 },
    { name: 'Visual', 'ABLLS-R': 8, 'AFLLS': 0, 'DAYC-2': 0 },
    { name: 'Receptive', 'ABLLS-R': 6, 'AFLLS': 0, 'DAYC-2': 0 },
    { name: 'Living Skills', 'ABLLS-R': 0, 'AFLLS': 9, 'DAYC-2': 0 },
    { name: 'Home Skills', 'ABLLS-R': 0, 'AFLLS': 7, 'DAYC-2': 0 },
    { name: 'Cognitive', 'ABLLS-R': 0, 'AFLLS': 0, 'DAYC-2': 8 },
    { name: 'Communication', 'ABLLS-R': 0, 'AFLLS': 0, 'DAYC-2': 7 },
  ],
  growthData: [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 25 },
    { month: 'Mar', progress: 35 },
    { month: 'Apr', progress: 42 },
    { month: 'May', progress: 50 },
    { month: 'Jun', progress: 58 },
  ]
};
