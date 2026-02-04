// Seed 50 realistic test leads into Supabase
const SUPABASE_URL = 'https://tptcgnpxwdhurwilpjrs.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const USER_ID = 'user_38fOMwOa5oK0P1r4pZdC7eEIgZI'

const firstNames = ['James','Maria','Robert','Jennifer','Michael','Linda','David','Patricia','William','Elizabeth','Richard','Barbara','Joseph','Susan','Thomas','Jessica','Daniel','Sarah','Matthew','Karen','Christopher','Nancy','Andrew','Lisa','Joshua','Betty','Brandon','Margaret','Justin','Sandra','Ryan','Ashley','Kevin','Dorothy','Brian','Kimberly','George','Emily','Timothy','Donna','Ronald','Michelle','Steven','Carol','Edward','Amanda','Jason','Melissa','Mark','Deborah']
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez']

const statuses = ['new','contacted','qualified','negotiating','closed','lost','hot','nurture','watch','pending','past_client','inactive']
const types = ['buyer','seller','both','investor','renter']
const sources = ['manual','realtor_com','zillow','trulia','redfin','friend_family','sphere','referral','website','open_house','social_media','other']
const stages = ['new_lead','attempted_contact','spoke_with_customer','appointment_set','met_with_customer','showing_homes','listing_agreement','active_listing','submitting_offers','under_contract','sale_closed','nurture','rejected']
const areas = ['Orlando','Winter Park','Kissimmee','Lake Nona','Dr. Phillips','Windermere','Altamonte Springs','Sanford','Clermont','Celebration','Davenport','Ocoee','Winter Garden','Apopka','Longwood']
const taskCategories = ['call','email','meeting','showing','follow-up','other']
const taskPriorities = ['low','medium','high']

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randPhone() { return `(${randInt(200,999)}) ${randInt(200,999)}-${randInt(1000,9999)}` }
function randEmail(first, last) { return `${first.toLowerCase()}.${last.toLowerCase()}@${pick(['gmail.com','yahoo.com','outlook.com','icloud.com','hotmail.com'])}` }
function randDate(daysBack, daysForward) {
  const d = new Date()
  d.setDate(d.getDate() + randInt(-daysBack, daysForward))
  return d.toISOString().split('T')[0]
}
function randBudget() {
  const bases = [150000,175000,200000,225000,250000,275000,300000,325000,350000,400000,450000,500000,600000,750000,1000000,1500000,2000000]
  const min = pick(bases)
  const max = min + pick([25000,50000,75000,100000,150000,200000,500000])
  return { min, max }
}

async function seed() {
  const leads = []
  const notes = []
  const tasks = []

  for (let i = 0; i < 50; i++) {
    const first = firstNames[i]
    const last = pick(lastNames)
    const status = pick(statuses)
    const type = pick(types)
    const budget = randBudget()
    const priority = randInt(1, 5)
    const hasFollowUp = Math.random() > 0.4
    const hasBirthday = Math.random() > 0.7
    const hasAnniversary = Math.random() > 0.8

    const lead = {
      user_id: USER_ID,
      name: `${first} ${last}`,
      email: Math.random() > 0.1 ? randEmail(first, last) : null,
      phone: Math.random() > 0.1 ? randPhone() : null,
      type,
      source: pick(sources),
      status,
      notes: pick([
        `Interested in ${pick(areas)} area. Prefers single family.`,
        `Referred by a friend. Looking for investment properties.`,
        `First-time buyer, needs guidance on the process.`,
        `Relocating from up north. Timeline is flexible.`,
        `Pre-approved for $${(budget.max/1000).toFixed(0)}k. Very motivated.`,
        `Wants a pool home with at least 3 bedrooms.`,
        `Currently renting, lease ends in 3 months.`,
        `Downsizing after kids moved out. Looking for low maintenance.`,
        `Military veteran, interested in VA loan options.`,
        `Cash buyer, wants to close quickly.`,
        null,
        null,
      ]),
      property_interest: pick([
        'Single Family Home',
        'Condo/Townhome',
        'Multi-Family (2-4 units)',
        'Vacant Land',
        'Commercial Property',
        'New Construction',
        null, null,
      ]),
      budget_min: type !== 'renter' ? budget.min : randInt(1200, 2500),
      budget_max: type !== 'renter' ? budget.max : randInt(2500, 4000),
      priority,
      follow_up_date: hasFollowUp ? randDate(5, 14) : null,
      preferred_area: pick(areas),
      birthday: hasBirthday ? `${randInt(1960,2000)}-${String(randInt(1,12)).padStart(2,'0')}-${String(randInt(1,28)).padStart(2,'0')}` : null,
      home_anniversary: hasAnniversary ? `${randInt(2015,2024)}-${String(randInt(1,12)).padStart(2,'0')}-${String(randInt(1,28)).padStart(2,'0')}` : null,
      created_at: new Date(Date.now() - randInt(1, 90) * 86400000).toISOString(),
    }

    leads.push(lead)
  }

  // Insert leads
  console.log('Inserting 50 leads...')
  const leadRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(leads),
  })

  if (!leadRes.ok) {
    console.error('Failed to insert leads:', await leadRes.text())
    return
  }

  const insertedLeads = await leadRes.json()
  console.log(`✅ ${insertedLeads.length} leads inserted`)

  // Add notes for ~30 leads
  const noteTemplates = [
    'Called and left voicemail. Will follow up tomorrow.',
    'Met at open house on Main St. Very interested in the area.',
    'Sent CMA report via email. Waiting for feedback.',
    'Pre-approval letter received from Wells Fargo.',
    'Showed 3 properties today. Liked the one on Oak Ave.',
    'Price reduced on their listing. Updated MLS.',
    'Signed buyer representation agreement.',
    'Submitted offer on 123 Elm Street. Waiting for response.',
    'Inspection completed. Minor issues found.',
    'Appraisal came back at value. Clear to close.',
    'Client wants to see more properties in Winter Park area.',
    'Discussed investment strategy. Interested in duplexes.',
    'Referred to mortgage broker at Navy Federal.',
    'Lease expires March 2026. Wants to start looking in Feb.',
    'HOA docs reviewed. No red flags.',
  ]

  for (let i = 0; i < 30; i++) {
    const lead = insertedLeads[i]
    const numNotes = randInt(1, 4)
    for (let j = 0; j < numNotes; j++) {
      notes.push({
        user_id: USER_ID,
        lead_id: lead.id,
        content: pick(noteTemplates),
        created_at: new Date(Date.now() - randInt(0, 30) * 86400000).toISOString(),
      })
    }
  }

  if (notes.length > 0) {
    console.log(`Inserting ${notes.length} notes...`)
    const noteRes = await fetch(`${SUPABASE_URL}/rest/v1/lead_notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(notes),
    })
    if (noteRes.ok) console.log('✅ Notes inserted')
    else console.error('Notes error:', await noteRes.text())
  }

  // Add tasks for ~20 leads
  const taskTemplates = [
    'Follow up call',
    'Send property listings',
    'Schedule showing',
    'Send CMA report',
    'Check pre-approval status',
    'Email market update',
    'Review inspection report',
    'Prepare listing presentation',
    'Update MLS photos',
    'Send closing checklist',
    'Call about offer status',
    'Schedule home inspection',
    'Coordinate with title company',
    'Send neighborhood info packet',
    'Review HOA documents',
  ]

  for (let i = 0; i < 20; i++) {
    const lead = insertedLeads[i]
    const numTasks = randInt(1, 3)
    for (let j = 0; j < numTasks; j++) {
      const isCompleted = Math.random() > 0.6
      const isOverdue = !isCompleted && Math.random() > 0.5
      tasks.push({
        user_id: USER_ID,
        lead_id: lead.id,
        title: pick(taskTemplates),
        description: null,
        due_date: isOverdue ? randDate(10, -1) : randDate(-2, 14),
        priority: pick(taskPriorities),
        status: isCompleted ? 'completed' : 'pending',
        category: pick(taskCategories),
        created_at: new Date(Date.now() - randInt(1, 30) * 86400000).toISOString(),
      })
    }
  }

  if (tasks.length > 0) {
    console.log(`Inserting ${tasks.length} tasks...`)
    const taskRes = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(tasks),
    })
    if (taskRes.ok) console.log('✅ Tasks inserted')
    else console.error('Tasks error:', await taskRes.text())
  }

  console.log('\n🎉 Seed complete! 50 leads + notes + tasks added.')
}

seed().catch(console.error)
