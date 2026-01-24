'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleLeads = [
  // HOT LEADS (Priority 1-3)
  { id: 1, name: 'Marcus Johnson', type: 'buyer', phone: '407-555-0101', email: 'marcus.j@email.com', priority: 1, status: 'qualified', budget: '$450,000', preferredArea: 'Winter Park', notes: '[1/10/2026 @ 2:30 PM] Initial contact - Pre-approved for $450K with First National Bank. Looking in Winter Park area. Wants 3BR/2BA minimum.\n\n[1/15/2026 @ 10:15 AM] Showed 3 properties in Winter Park. Really liked 456 Oak Lane but concerned about backyard size. Very motivated - lease ends in 45 days!\n\n[1/20/2026 @ 4:45 PM] Called to follow up on Oak Lane property. Still thinking about it. Will decide by end of week.', birthday: '1985-03-15', followUpDate: '2026-01-25', createdAt: '2026-01-10' },
  { id: 2, name: 'Sarah Chen', type: 'seller', phone: '407-555-0102', email: 'sarah.chen@gmail.com', priority: 1, status: 'negotiating', budget: '$485,000', preferredArea: 'Dr. Phillips', notes: '[1/15/2026 @ 9:00 AM] Initial call - wants to sell home in Dr. Phillips. 4BR/3BA pool home. Relocating to Seattle for tech job.\n\n[1/18/2026 @ 11:30 AM] Completed CMA - suggested list price $485K based on comps. She agreed. Listing appointment scheduled for Friday.\n\n[1/20/2026 @ 3:00 PM] Sent over listing agreement for review. Needs to sell within 60 days for job start date.', followUpDate: '2026-01-24', createdAt: '2026-01-15' },
  { id: 3, name: 'Robert & Linda Williams', type: 'buyer55', phone: '407-555-0103', email: 'rwilliams55@aol.com', priority: 2, status: 'qualified', budget: '$600,000', preferredArea: 'Solivita/Del Webb', notes: '[1/8/2026 @ 1:00 PM] Referral from John Smith. Retiring couple from Chicago. Cash buyers with $600K budget.\n\n[1/12/2026 @ 10:00 AM] Phone consultation - want 55+ community with golf. Interested in Solivita and Del Webb. Planning FL visit end of January.\n\n[1/18/2026 @ 2:15 PM] Confirmed visit dates Jan 28-30. Scheduled tours of 3 communities.', birthday: '1958-07-22', followUpDate: '2026-01-28', createdAt: '2026-01-08' },
  { id: 4, name: 'David Martinez', type: 'investor', phone: '407-555-0104', email: 'dmartinez.invest@email.com', priority: 2, status: 'contacted', budget: '$200,000 down', preferredArea: 'Multi-family', notes: '[1/12/2026 @ 4:00 PM] Met at investor meetup. Looking for multi-family or duplex properties. Has $200K for down payment.\n\n[1/16/2026 @ 9:30 AM] Sent 5 multi-family listings. Wants 8%+ cap rate. Experienced investor with 5 existing properties.\n\n[1/21/2026 @ 11:00 AM] Interested in the Pine Street duplex. Requested full financials and rent rolls.', followUpDate: '2026-01-26', createdAt: '2026-01-12' },
  { id: 5, name: 'Jennifer Thompson', type: 'buyer', phone: '407-555-0105', email: 'jthompson@outlook.com', priority: 3, status: 'qualified', budget: '$320,000', preferredArea: 'Oviedo/Winter Springs', notes: '[1/5/2026 @ 3:30 PM] Website lead - first-time homebuyer. Single mom with 2 kids (ages 8 and 11).\n\n[1/8/2026 @ 10:00 AM] Phone call - Pre-approved $320K with FHA through Quicken. Needs good school district - prefer Oviedo/Winter Springs.\n\n[1/15/2026 @ 2:00 PM] Showed 4 homes in Oviedo. Loved the one on Magnolia but it went under contract. Still searching.', birthday: '1990-11-08', followUpDate: '2026-01-24', createdAt: '2026-01-05' },
  { id: 6, name: 'Michael & Amy Foster', type: 'seller', phone: '407-555-0106', email: 'fosterfamily@gmail.com', priority: 3, status: 'contacted', budget: '$275,000', preferredArea: 'Sanford', notes: '[1/18/2026 @ 11:00 AM] Inherited property in Sanford from Amy\'s mother. 3BR/2BA built 1995.\n\n[1/20/2026 @ 4:30 PM] Visited property - needs updates (kitchen, bathrooms, roof is 15 years old). Willing to price competitively for quick sale. Suggested $275K as-is.', followUpDate: '2026-01-25', createdAt: '2026-01-18' },
  
  // WARM LEADS (Priority 4-6)
  { id: 7, name: 'Christopher Lee', type: 'buyer', phone: '407-555-0107', email: 'chris.lee@techcorp.com', priority: 4, status: 'contacted', budget: '$500-600K', preferredArea: 'Modern homes', notes: '[1/2/2026 @ 9:00 AM] LinkedIn connection - tech professional relocating from Austin. Budget $500-600K.\n\n[1/10/2026 @ 3:00 PM] Video call - wants modern home with dedicated home office space. Timeline: 3 months before job starts.', followUpDate: '2026-01-27', createdAt: '2026-01-02' },
  { id: 8, name: 'Patricia Moore', type: 'buyer55', phone: '407-555-0108', email: 'patmoore@yahoo.com', priority: 4, status: 'contacted', budget: '$350,000', preferredArea: '55+ Community', notes: '[12/20/2025 @ 2:00 PM] Widow, downsizing from 4BR home where she raised her family.\n\n[1/5/2026 @ 10:30 AM] Wants single-story, 2BR in active adult community. Budget $350K. Not in a rush - emotionally difficult decision.', birthday: '1955-04-20', homeAnniversary: '1985-06-15', followUpDate: '2026-01-30', createdAt: '2025-12-20' },
  { id: 9, name: 'James Wilson', type: 'investor', phone: '407-555-0109', email: 'jwilson.properties@email.com', priority: 4, status: 'contacted', budget: '$400,000', preferredArea: 'Near Disney', notes: '[1/11/2026 @ 1:00 PM] Looking for vacation rental properties near Disney. Budget $400K. Wants to Airbnb.\n\n[1/17/2026 @ 11:00 AM] Discussed STR regulations in Orange County. Need to research Osceola County options.', followUpDate: '2026-01-28', createdAt: '2026-01-11' },
  { id: 10, name: 'Emily Davis', type: 'seller', phone: '407-555-0110', email: 'emily.d@email.com', priority: 5, status: 'new', budget: '', preferredArea: 'Lake Mary', notes: '[12/15/2025 @ 4:00 PM] Thinking of selling in spring. Lake Mary townhome, 3BR/2.5BA. Bought in 2019 for $280K.\n\n[1/10/2026 @ 9:00 AM] Requested CMA - still deciding. Curious about current value but not committed yet.', homeAnniversary: '2019-08-10', followUpDate: '2026-02-01', createdAt: '2025-12-15' },
  { id: 11, name: 'Daniel & Maria Garcia', type: 'buyer', phone: '407-555-0111', email: 'garciaFamily@gmail.com', priority: 5, status: 'qualified', budget: '$400,000', preferredArea: 'Clermont/Windermere', notes: '[1/7/2026 @ 2:30 PM] Growing family - baby on the way in April! Need to upgrade from 2BR condo.\n\n[1/14/2026 @ 10:00 AM] Pre-approved $400K conventional. Want 4BR in Clermont/Windermere area with good schools.', birthday: '1988-12-03', followUpDate: '2026-01-29', createdAt: '2026-01-07' },
  { id: 12, name: 'Nancy Anderson', type: 'buyer55', phone: '407-555-0112', email: 'nanderson@retired.net', priority: 5, status: 'contacted', budget: '$300,000', preferredArea: 'The Villages', notes: '[12/28/2025 @ 3:00 PM] Snowbird from Michigan. Looking for winter home in FL. Budget $300K.\n\n[1/8/2026 @ 11:00 AM] Wants condo with amenities - pool, clubhouse. Considering The Villages or similar.', followUpDate: '2026-02-05', createdAt: '2025-12-28' },
  { id: 13, name: 'Kevin Brown', type: 'buyer', phone: '407-555-0113', email: 'kbrown@company.com', priority: 6, status: 'new', budget: '$350,000', preferredArea: 'Downtown Orlando', notes: '[1/14/2026 @ 5:00 PM] Just started looking. Currently renting in downtown Orlando, lease ends in 6 months. Budget around $350K. Wants to stay close to downtown.', followUpDate: '2026-02-10', createdAt: '2026-01-14' },
  { id: 14, name: 'Lisa Taylor', type: 'seller', phone: '407-555-0114', email: 'ltaylor@email.com', priority: 6, status: 'new', budget: '', preferredArea: 'Longwood', notes: '[12/10/2025 @ 1:00 PM] Empty nester - kids moved out. 5BR home in Longwood. Considering downsizing but not committed. Just exploring options for now.', birthday: '1965-09-25', followUpDate: '2026-02-15', createdAt: '2025-12-10' },
  { id: 15, name: 'Steven Wright', type: 'investor', phone: '407-555-0115', email: 'swright.rei@email.com', priority: 6, status: 'contacted', budget: '$100,000 saved', preferredArea: 'House hack', notes: '[1/9/2026 @ 10:00 AM] New investor, attended my first-time investor webinar. Has $100K saved. Interested in house hacking strategy - wants to learn more.', followUpDate: '2026-02-01', createdAt: '2026-01-09' },
  
  // COLD LEADS (Priority 7-10)
  { id: 16, name: 'Thomas Jackson', type: 'buyer', phone: '407-555-0116', email: 'tjackson@email.com', priority: 7, status: 'new', budget: '', preferredArea: '', notes: '[10/15/2025 @ 2:00 PM] Met at open house on Maple Street. Said buying in 1-2 years. Just checking in periodically.', createdAt: '2025-10-15' },
  { id: 17, name: 'Barbara White', type: 'buyer55', phone: '407-555-0117', email: 'bwhite@senior.net', priority: 7, status: 'new', budget: '', preferredArea: '55+', notes: '[11/20/2025 @ 3:30 PM] Referred by past client Jane Doe. Not ready yet - husband still working. Planning for retirement in 2 years.', birthday: '1962-02-14', createdAt: '2025-11-20' },
  { id: 18, name: 'Richard Harris', type: 'seller', phone: '407-555-0118', email: 'rharris@email.com', priority: 7, status: 'new', budget: '', preferredArea: 'Maitland', notes: '[9/5/2025 @ 4:00 PM] Wanted to sell last year but decided to wait due to market conditions. Maitland home, 4BR/2BA. Check back in spring.', createdAt: '2025-09-05' },
  { id: 19, name: 'Susan Clark', type: 'buyer', phone: '407-555-0119', email: 'sclark@outlook.com', priority: 8, status: 'new', budget: '', preferredArea: '', notes: '[9/20/2025 @ 11:00 AM] Inquiry from Zillow 4 months ago. Sent some listings, no response since. Try re-engaging.', createdAt: '2025-09-20' },
  { id: 20, name: 'Joseph Lewis', type: 'investor', phone: '407-555-0120', email: 'jlewis.invest@email.com', priority: 8, status: 'new', budget: '', preferredArea: '', notes: '[10/1/2025 @ 7:00 PM] Attended investor seminar. Interested but still saving for down payment. Added to market update drip.', createdAt: '2025-10-01' },
  { id: 21, name: 'Margaret Robinson', type: 'buyer55', phone: '407-555-0121', email: 'mrobinson@aol.com', priority: 8, status: 'new', budget: '', preferredArea: '', notes: '[3/15/2024 @ 2:00 PM] Past client referral from 2 years ago. Hasnt been active but keeping in drip campaign.', birthday: '1960-05-30', createdAt: '2024-03-15' },
  { id: 22, name: 'Charles Walker', type: 'buyer', phone: '407-555-0122', email: 'cwalker@gmail.com', priority: 9, status: 'new', budget: '', preferredArea: '', notes: '[6/20/2024 @ 9:00 AM] Old lead from website. No recent activity. Keep in drip campaign.', createdAt: '2024-06-20' },
  { id: 23, name: 'Dorothy Hall', type: 'seller', phone: '407-555-0123', email: 'dhall@email.com', priority: 9, status: 'new', budget: '', preferredArea: '', notes: '[5/10/2025 @ 1:00 PM] Spoke 8 months ago about possibly selling. Said market wasnt right. Follow up quarterly.', createdAt: '2025-05-10' },
  { id: 24, name: 'George Allen', type: 'buyer55', phone: '407-555-0124', email: 'gallen55@retired.com', priority: 10, status: 'new', budget: '', preferredArea: '', notes: '[11/15/2023 @ 3:00 PM] Very cold lead. Met at community event years ago. Just keep in database.', createdAt: '2023-11-15' },
  { id: 25, name: 'Betty Young', type: 'buyer', phone: '407-555-0125', email: 'byoung@yahoo.com', priority: 10, status: 'lost', budget: '', preferredArea: '', notes: '[1/20/2024 @ 10:00 AM] Unresponsive to last 3 contact attempts. May remove from active list.', createdAt: '2024-01-20' },
  
  // MORE DIVERSE SCENARIOS
  { id: 26, name: 'Frank & Helen King', type: 'buyer', phone: '407-555-0126', email: 'kingfamily@email.com', priority: 3, status: 'qualified', budget: '$380,000', preferredArea: 'Waterford Lakes', notes: '[1/16/2026 @ 8:00 AM] Military family, PCS orders to Orlando. VA loan pre-approved $380K.\n\n[1/19/2026 @ 2:00 PM] Need quick close - reporting to base in 60 days. Prefer Waterford Lakes area near base.', followUpDate: '2026-01-23', createdAt: '2026-01-16' },
  { id: 27, name: 'Carol Scott', type: 'seller', phone: '407-555-0127', email: 'cscott@email.com', priority: 2, status: 'negotiating', budget: '', preferredArea: 'Baldwin Park', notes: '[1/19/2026 @ 11:00 AM] FSBO that called for help. Listed herself for 90 days with no offers. Baldwin Park condo.\n\n[1/21/2026 @ 3:00 PM] Met at property - needs professional photos and proper pricing. Ready to sign listing agreement.', followUpDate: '2026-01-24', createdAt: '2026-01-19' },
  { id: 28, name: 'Raymond Green', type: 'investor', phone: '407-555-0128', email: 'rgreen.capital@email.com', priority: 1, status: 'qualified', budget: '$2-5M', preferredArea: 'Commercial/Multi-family', notes: '[1/20/2026 @ 9:00 AM] Institutional investor rep from Green Capital Partners. Looking for 10+ unit apartment buildings.\n\n[1/21/2026 @ 4:00 PM] Budget $2-5M. Serious buyer - need to find inventory ASAP. Connected with commercial team.', followUpDate: '2026-01-24', createdAt: '2026-01-20' },
  { id: 29, name: 'Ruth Adams', type: 'buyer55', phone: '407-555-0129', email: 'radams@email.com', priority: 3, status: 'qualified', budget: '$500,000 cash', preferredArea: '55+ with pickle ball', notes: '[1/13/2026 @ 10:00 AM] Selling home in NJ, moving to FL full time. Cash from sale approx $500K.\n\n[1/18/2026 @ 1:00 PM] Wants 55+ community with pickle ball courts and pool. Very active lifestyle!', birthday: '1957-08-12', followUpDate: '2026-01-26', createdAt: '2026-01-13' },
  { id: 30, name: 'Paul Nelson', type: 'buyer', phone: '407-555-0130', email: 'pnelson@techstartup.com', priority: 4, status: 'qualified', budget: '$280,000', preferredArea: 'Near UCF', notes: '[1/6/2026 @ 4:00 PM] Young professional at tech startup, first-time buyer. Pre-approved $280K.\n\n[1/12/2026 @ 11:00 AM] Wants condo or townhome near UCF/Research Park for short commute.', birthday: '1995-01-28', followUpDate: '2026-01-28', createdAt: '2026-01-06' },
  { id: 31, name: 'Diane Carter', type: 'seller', phone: '407-555-0131', email: 'dcarter@email.com', priority: 4, status: 'contacted', budget: '', preferredArea: 'Altamonte Springs', notes: '[1/17/2026 @ 2:00 PM] Divorce situation - need to sell marital home. Both parties cooperative.\n\n[1/20/2026 @ 10:00 AM] Altamonte Springs, 4BR/2BA. Attorney involved. Need sold quickly to finalize settlement.', followUpDate: '2026-01-25', createdAt: '2026-01-17' },
  { id: 32, name: 'Mark & Julie Mitchell', type: 'buyer', phone: '407-555-0132', email: 'mitchells@gmail.com', priority: 5, status: 'qualified', budget: '$550,000', preferredArea: '', notes: '[1/4/2026 @ 3:00 PM] Have buyer for their current home contingent on finding new one.\n\n[1/15/2026 @ 9:00 AM] Need 5BR for multigenerational living - mom moving in. Budget $550K.', followUpDate: '2026-01-30', createdAt: '2026-01-04' },
  { id: 33, name: 'Sandra Perez', type: 'buyer55', phone: '407-555-0133', email: 'sperez@email.com', priority: 5, status: 'contacted', budget: '', preferredArea: '55+ Community', notes: '[12/22/2025 @ 11:00 AM] Recently widowed, needs to downsize. Current home has too many memories.\n\n[1/8/2026 @ 2:00 PM] Looking for fresh start in 55+ community. Very emotional - be patient and supportive.', birthday: '1959-11-15', followUpDate: '2026-02-01', createdAt: '2025-12-22' },
  { id: 34, name: 'William Roberts', type: 'investor', phone: '407-555-0134', email: 'wroberts.llc@email.com', priority: 4, status: 'qualified', budget: '$800K-1M', preferredArea: 'Commercial/Multi-family', notes: '[1/21/2026 @ 8:00 AM] 1031 EXCHANGE BUYER! Must identify properties within 45 days from Jan 15.\n\n[1/22/2026 @ 10:00 AM] Looking for $800K-1M commercial or multi-family. TIME SENSITIVE!', followUpDate: '2026-01-24', createdAt: '2026-01-21' },
  { id: 35, name: 'Elizabeth Turner', type: 'buyer', phone: '407-555-0135', email: 'eturner@hospital.org', priority: 3, status: 'qualified', budget: '$350,000', preferredArea: 'Near AdventHealth', notes: '[1/18/2026 @ 12:00 PM] Travel nurse accepting permanent position at AdventHealth.\n\n[1/20/2026 @ 3:30 PM] Needs home within 30 min of hospital. Budget $350K. Pre-approved with Navy Federal.', followUpDate: '2026-01-25', createdAt: '2026-01-18' },
  { id: 36, name: 'Andrew Phillips', type: 'seller', phone: '407-555-0136', email: 'aphillips@email.com', priority: 5, status: 'new', budget: '', preferredArea: '', notes: '[12/18/2025 @ 4:00 PM] Owns rental property, tenant moving out in 2 months.\n\n[1/10/2026 @ 11:00 AM] Deciding whether to sell or re-rent. Needs rental analysis vs sale proceeds comparison.', homeAnniversary: '2018-03-20', followUpDate: '2026-02-01', createdAt: '2025-12-18' },
  { id: 37, name: 'Jessica Campbell', type: 'buyer', phone: '407-555-0137', email: 'jcampbell@lawfirm.com', priority: 4, status: 'contacted', budget: '$600,000+', preferredArea: 'Downtown Orlando/Baldwin Park', notes: '[1/3/2026 @ 6:00 PM] Attorney at downtown law firm. Wants luxury condo in downtown Orlando or Baldwin Park.\n\n[1/12/2026 @ 1:00 PM] Budget $600K+. Prefers new construction with concierge services.', birthday: '1982-06-08', followUpDate: '2026-01-27', createdAt: '2026-01-03' },
  { id: 38, name: 'Donald Parker', type: 'buyer55', phone: '407-555-0138', email: 'dparker@retired.mil', priority: 6, status: 'new', budget: '$450,000', preferredArea: '55+ with military discount', notes: '[12/5/2025 @ 2:00 PM] Retired military officer (Colonel). VA eligible. Looking at 55+ communities with military discount. Budget flexible up to $450K.', birthday: '1956-12-07', followUpDate: '2026-02-10', createdAt: '2025-12-05' },
  { id: 39, name: 'Michelle Evans', type: 'seller', phone: '407-555-0139', email: 'mevans@email.com', priority: 6, status: 'new', budget: '', preferredArea: 'Hunters Creek', notes: '[12/12/2025 @ 3:00 PM] Relocating to Seattle for job promotion. Has 4 months to sell. Hunters Creek home, 3BR/2BA. Well maintained, should sell quickly.', followUpDate: '2026-02-01', createdAt: '2025-12-12' },
  { id: 40, name: 'Jason Edwards', type: 'investor', phone: '407-555-0140', email: 'jedwards.rei@email.com', priority: 5, status: 'contacted', budget: 'Under $200K', preferredArea: 'BRRRR properties', notes: '[1/8/2026 @ 7:00 PM] BRRRR investor looking for distressed properties. Willing to do major rehab.\n\n[1/15/2026 @ 10:00 AM] Target ARV $300-400K, wants to purchase under $200K. Has contractor on standby.', followUpDate: '2026-01-28', createdAt: '2026-01-08' },
  { id: 41, name: 'Amanda Collins', type: 'buyer', phone: '407-555-0141', email: 'acollins@email.com', priority: 7, status: 'new', budget: '', preferredArea: '', notes: '[1/10/2026 @ 4:00 PM] Referred by Jennifer Thompson. Just starting to think about buying. Not pre-approved yet. Nurture lead.', followUpDate: '2026-02-15', createdAt: '2026-01-10' },
  { id: 42, name: 'Larry Stewart', type: 'buyer55', phone: '407-555-0142', email: 'lstewart@email.com', priority: 7, status: 'new', budget: '', preferredArea: 'Solivita', notes: '[11/30/2025 @ 1:00 PM] Met at Solivita open house. Said maybe in 6 months. Wife not fully on board with move yet.', followUpDate: '2026-03-01', createdAt: '2025-11-30' },
  { id: 43, name: 'Kimberly Sanchez', type: 'seller', phone: '407-555-0143', email: 'ksanchez@email.com', priority: 8, status: 'new', budget: '', preferredArea: '', notes: '[8/15/2025 @ 10:00 AM] Called about selling but decided to refinance instead. Check back in 1 year.', createdAt: '2025-08-15' },
  { id: 44, name: 'Brian Morris', type: 'buyer', phone: '407-555-0144', email: 'bmorris@email.com', priority: 8, status: 'new', budget: '', preferredArea: '', notes: '[10/25/2025 @ 9:00 AM] Lead from Facebook ad. Downloaded buyers guide but no further engagement. Add to drip.', createdAt: '2025-10-25' },
  { id: 45, name: 'Stephanie Rogers', type: 'investor', phone: '407-555-0145', email: 'srogers@email.com', priority: 9, status: 'new', budget: '', preferredArea: '', notes: '[7/20/2025 @ 6:00 PM] Attended webinar on real estate investing. Asked lots of questions but no follow through yet.', createdAt: '2025-07-20' },
  { id: 46, name: 'Timothy Reed', type: 'buyer55', phone: '407-555-0146', email: 'treed@email.com', priority: 9, status: 'new', budget: '', preferredArea: '', notes: '[12/1/2024 @ 3:00 PM] Old sphere of influence contact. Retired last year. Might be interested in downsizing eventually.', birthday: '1958-10-03', createdAt: '2024-12-01' },
  { id: 47, name: 'Rebecca Cook', type: 'buyer', phone: '407-555-0147', email: 'rcook@email.com', priority: 10, status: 'lost', budget: '', preferredArea: '', notes: '[1/15/2024 @ 11:00 AM] Inquiry from 2 years ago. Never responded to follow up. Keep in database.', createdAt: '2024-01-15' },
  { id: 48, name: 'Gregory Morgan', type: 'seller', phone: '407-555-0148', email: 'gmorgan@email.com', priority: 10, status: 'lost', budget: '', preferredArea: '', notes: '[2/20/2024 @ 2:00 PM] Wanted to list 2 years ago but price expectations were unrealistic ($50K over market). Might have adjusted by now.', createdAt: '2024-02-20' },
  { id: 49, name: 'Nicole Bell', type: 'buyer', phone: '407-555-0149', email: 'nbell@email.com', priority: 6, status: 'contacted', budget: '', preferredArea: '', notes: '[12/1/2025 @ 5:00 PM] Newlywed couple (married Oct 2025), currently renting. Want to buy within a year.\n\n[1/10/2026 @ 10:00 AM] Pre-qualification in progress with lender. Saving for down payment - targeting spring/summer.', birthday: '1993-04-18', followUpDate: '2026-02-01', createdAt: '2025-12-01' },
  { id: 50, name: 'Eric & Samantha Murphy', type: 'buyer', phone: '407-555-0150', email: 'murphys@email.com', priority: 2, status: 'qualified', budget: '$475,000', preferredArea: 'Lake Nona', notes: '[1/22/2026 @ 9:00 AM] HIGHLY MOTIVATED! Previous offer fell through due to inspection issues on another home.\n\n[1/22/2026 @ 11:30 AM] Pre-approved $475K with locked rate. Ready to write offers immediately. Showing scheduled this weekend - 3 homes in Lake Nona!', followUpDate: '2026-01-25', createdAt: '2026-01-22' }
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', type: 'buyer', status: 'new', priority: 5,
    budget: '', preferredArea: '', followUpDate: '', birthday: '', homeAnniversary: '', notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_leads')
    if (saved) {
      const parsed = JSON.parse(saved)
      setLeads(parsed.length > 0 ? parsed : sampleLeads)
    } else {
      setLeads(sampleLeads)
    }
  }, [])

  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('repal_leads', JSON.stringify(leads))
    }
  }, [leads])

  const getPriorityColor = (p: number) => {
    if (p <= 3) return '#C97B63'
    if (p <= 6) return '#D4AF37'
    return '#666'
  }

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = { new: '#4ECDC4', contacted: '#6B8DD6', qualified: '#D4AF37', negotiating: '#C97B63', closed: '#4A9B7F', lost: '#666' }
    return colors[s] || '#666'
  }

  const getTypeColor = (t: string) => {
    const colors: Record<string, string> = { buyer: '#4A9B7F', buyer55: '#4A9B7F', seller: '#6B8DD6', investor: '#9B59B6', renter: '#E67E22' }
    return colors[t] || '#666'
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || 
      (priorityFilter === 'hot' && lead.priority <= 3) ||
      (priorityFilter === 'warm' && lead.priority > 3 && lead.priority <= 6) ||
      (priorityFilter === 'cold' && lead.priority > 6)
    return matchesSearch && matchesStatus && matchesPriority
  }).sort((a, b) => a.priority - b.priority)

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', type: 'buyer', status: 'new', priority: 5, budget: '', preferredArea: '', followUpDate: '', birthday: '', homeAnniversary: '', notes: '' })
    setShowForm(false)
    setEditingLead(null)
  }

  const openEditForm = (lead: any) => {
    setEditingLead(lead)
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      type: lead.type || 'buyer',
      status: lead.status || 'new',
      priority: lead.priority || 5,
      budget: lead.budget || '',
      preferredArea: lead.preferredArea || '',
      followUpDate: lead.followUpDate || '',
      birthday: lead.birthday || '',
      homeAnniversary: lead.homeAnniversary || '',
      notes: lead.notes || ''
    })
    setShowForm(true)
  }

  const saveLead = () => {
    if (editingLead) {
      setLeads(leads.map(l => l.id === editingLead.id ? { ...formData, id: editingLead.id, createdAt: editingLead.createdAt } : l))
    } else {
      setLeads([...leads, { ...formData, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }])
    }
    resetForm()
  }

  const deleteLead = (id: number) => {
    if (confirm('Delete this lead?')) setLeads(leads.filter(l => l.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👥 Lead Manager</h1>
            <span style={{ backgroundColor: '#333', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{filteredLeads.length} leads</span>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Add Lead</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="negotiating">Negotiating</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Priority</option>
            <option value="hot">🔥 Hot (1-3)</option>
            <option value="warm">🌡️ Warm (4-6)</option>
            <option value="cold">❄️ Cold (7-10)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredLeads.map(lead => (
            <div key={lead.id} onClick={() => openEditForm(lead)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: getPriorityColor(lead.priority), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>{lead.priority}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600' }}>{lead.name}</span>
                    <span style={{ backgroundColor: getTypeColor(lead.type), padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>{lead.type}</span>
                    <span style={{ backgroundColor: getStatusColor(lead.status), padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>{lead.status}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.25rem' }}>
                    {lead.phone && <span style={{ marginRight: '1rem' }}>📱 {lead.phone}</span>}
                    {lead.email && <span>✉️ {lead.email}</span>}
                  </div>
                  {lead.budget && <div style={{ fontSize: '0.75rem', color: '#D4AF37', marginTop: '0.25rem' }}>💰 {lead.budget}</div>}
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteLead(lead.id) }} style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} className="delete-btn">🗑️</button>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingLead ? '✏️ Edit Lead' : '➕ Add New Lead'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="buyer">Buyer</option>
                    <option value="buyer55">Buyer 55+</option>
                    <option value="seller">Seller</option>
                    <option value="investor">Investor</option>
                    <option value="renter">Renter</option>
                  </select>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} - {n <= 3 ? 'Hot 🔥' : n <= 6 ? 'Warm 🌡️' : 'Cold ❄️'}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="text" placeholder="Budget" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="text" placeholder="Preferred Area" value={formData.preferredArea} onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#999' }}>Follow-up Date</label>
                    <input type="date" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#999' }}>Birthday</label>
                    <input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#999' }}>Home Anniversary</label>
                    <input type="date" value={formData.homeAnniversary} onChange={(e) => setFormData({ ...formData, homeAnniversary: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                  </div>
                </div>
                <textarea placeholder="Notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveLead} disabled={!formData.name} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.name ? 1 : 0.5 }}>{editingLead ? 'Save Changes' : 'Add Lead'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .group:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
