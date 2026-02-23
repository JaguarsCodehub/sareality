**PRODUCT REQUIREMENTS DOCUMENT**

**SA Reality CRM**

*Real Estate Sales & Marketing Intelligence Platform*

  -----------------------------------------------------------------------
  **Version**                         v1.0 --- MVP
  ----------------------------------- -----------------------------------
  **Date**                            February 2026

  **Status**                          Draft --- For Review

  **Target Segment**                  Indian Real Estate Firms
  -----------------------------------------------------------------------

*Confidential --- Internal Use Only*

# **1. Executive Summary**

SA Reality CRM is a purpose-built sales and marketing intelligence
platform for real estate firms currently managing their leads and sales
pipeline through Google Sheets and unstructured phone-based outreach.
The platform replaces fragmented, manual processes with a centralized
system that gives sales agents, team leaders, and management complete
visibility into every lead\'s lifecycle --- from first touch to final
booking.

The core problem this product solves is a breakdown in three critical
areas: there is no structured way to track where a customer is in the
buying journey, no enforced follow-up discipline, and no marketing
communication channel beyond cold calls. Deals are being lost silently
--- not because leads are uninterested, but because agents forget to
follow up, managers cannot identify which leads need attention, and
there is no mechanism to send timely, personalized marketing messages at
scale.

  -----------------------------------------------------------------------
  *SA Reality is not a generic CRM with real estate labels bolted on.
  Every field, every workflow, and every automation has been designed
  around how Indian real estate sales teams actually operate --- from
  portal leads to site visits to token collection.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

The platform will be delivered as a web application accessible via
desktop and mobile browsers, integrated with WhatsApp Business API for
marketing communication, and powered by AI capabilities that reduce
manual effort and surface the right actions at the right time.

# **2. Problem Statement**

## **2.1 Current State --- What They\'re Working With**

The firm\'s current sales process relies entirely on a shared Google
Sheet that serves simultaneously as a lead database, task tracker, and
communication log. This approach has reached a critical failure point as
the team and lead volume have grown.

  -----------------------------------------------------------------------
  **Pain Point**          **Business Impact**     **Severity**
  ----------------------- ----------------------- -----------------------
  No lead lifecycle       Agents don\'t know what Critical
  tracking                stage a customer is in, 
                          leading to inconsistent 
                          follow-ups and pitches  

  No follow-up            Leads go cold because   Critical
  enforcement             no one reminds agents   
                          to call back; no        
                          escalation if follow-up 
                          is missed               

  No role hierarchy or    Any agent can see or    High
  access control          modify any lead; no     
                          accountability for lead 
                          ownership               

  No task assignment from Managers cannot assign  High
  management              leads or tasks to       
                          specific agents;        
                          reliance on verbal      
                          instructions            

  No WhatsApp marketing   Cannot send bulk or     High
  capability              targeted messages to    
                          hot leads for project   
                          launches, pricing       
                          updates, etc.           

  No reporting or         Management has zero     Medium
  pipeline visibility     real-time insight into  
                          pipeline health, agent  
                          performance, or         
                          conversion rates        

  No audit trail          Cannot see who changed  Medium
                          a lead\'s status or     
                          when; disputes over     
                          lead ownership are      
                          unresolvable            

  Data quality issues     Duplicate leads,        Medium
                          missing fields,         
                          inconsistent formatting 
                          --- all due to          
                          free-form spreadsheet   
                          entry                   
  -----------------------------------------------------------------------

## **2.2 Who Is Affected**

-   Sales Agents --- spend time searching for the right lead to call
    > instead of selling

-   Team Leaders --- have no visibility into team activity without
    > manually reviewing the sheet

-   Management / Admin --- cannot measure what is working, which
    > channels bring quality leads, or who their best performers are

-   Customers --- experience inconsistent communication, feel forgotten
    > between interactions

# **3. Goals & Success Metrics**

## **3.1 Product Goals**

1.  Give every lead a clear owner and a defined position in the sales
    > pipeline at all times

2.  Enforce follow-up discipline through automated task creation and
    > escalation alerts

3.  Enable targeted WhatsApp marketing to segmented lead lists with full
    > delivery tracking

4.  Give management real-time visibility into pipeline health and team
    > performance

5.  Reduce manual data entry for agents through AI-assisted call logging
    > and lead enrichment

6.  Create an audit trail for every lead interaction so accountability
    > is clear

## **3.2 Success Metrics (Target --- 90 days post-launch)**

  -----------------------------------------------------------------------
  **Metric**              **Baseline (Current)**  **Target**
  ----------------------- ----------------------- -----------------------
  Follow-up completion    \~30% (untracked)       85%+
  rate                                            

  Average response time   2--5 hours              \< 30 minutes
  to new lead                                     

  Lead data completeness  \~40%                   90%+
  score                                           

  WhatsApp message open   N/A                     \> 60%
  rate                                            

  Site visit conversion   Unknown                 Tracked & improving
  (Lead → Visit)                                  

  Agent daily call volume 0% (no tracking)        100%
  visibility                                      

  Manager report          2--3 hours manual       \< 5 minutes automated
  generation time                                 
  -----------------------------------------------------------------------

# **4. User Personas & Role Architecture**

## **4.1 Role Hierarchy**

The system uses a four-tier role model. Each role has distinct
permissions for viewing, editing, assigning, and reporting on leads. The
hierarchy is strictly enforced --- agents cannot see leads outside their
portfolio, ensuring both data security and clear accountability.

  ------------------------------------------------------------------------
  **Role**          **Who They Are**  **Core             **Access Scope**
                                      Responsibility**   
  ----------------- ----------------- ------------------ -----------------
  Super Admin       Product owner /   System             Full system
                    IT admin          configuration,     access
                                      billing,           
                                      integrations       

  Admin / Manager   Sales head or     Assign leads, view Full
                    branch manager    all pipelines,     organizational
                                      generate reports,  access
                                      manage campaigns   

  Team Leader       Senior agent      Monitor team\'s    Team-level access
                    managing a        leads, reassign    
                    sub-team          within team,       
                                      assist on          
                                      negotiations       

  Sales Agent       Front-line sales  Call leads, log    Own leads only
                    executive         interactions,      
                                      update stages,     
                                      schedule site      
                                      visits             
  ------------------------------------------------------------------------

## **4.2 Persona Profiles**

### **Persona A --- Rahul, Sales Agent**

Rahul is 26, handles 80--120 leads at any given time, makes 40--60 calls
per day, and currently uses a personal WhatsApp to send property
brochures. He forgets follow-ups frequently, not out of laziness but
because his lead list is a 200-row Google Sheet with no sorting or
prioritization. He needs a daily task queue that tells him exactly who
to call, in what order, and why.

### **Persona B --- Priya, Sales Manager**

Priya manages a team of 8 agents and spends 2--3 hours every Monday
manually reviewing the shared sheet to understand pipeline status. She
has no way to know which leads have been neglected, which agents are
underperforming, or which project is generating the most interest. She
needs a real-time dashboard and exception alerts --- not a spreadsheet
to babysit.

### **Persona C --- Vikram, Business Owner**

Vikram runs the firm and wants one thing: bookings. He reviews pipeline
reports monthly and has no granular visibility into deal health. He
needs high-level business intelligence --- conversion rates by channel,
pipeline value, project-wise inventory movement, and team performance
rankings --- accessible from his phone in under 2 minutes.

# **5. Product Modules --- Detailed Specifications**

## **Module 1 --- Lead & Contact Management**

  -----------------------------------------------------------------------
  *This is the foundation layer. Every other module depends on the
  quality and completeness of lead data captured here. Data quality gates
  will be enforced at entry --- incomplete mandatory fields block save.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

### **5.1.1 Lead Profile --- Standard Fields**

  -------------------------------------------------------------------------
  **Field Name**    **Type**          **Mandatory**     **Notes**
  ----------------- ----------------- ----------------- -------------------
  Full Name         Text              Yes               Minimum 2
                                                        characters

  Primary Phone     Phone             Yes               Validated format;
                                                        auto-checked
                                                        against duplicates

  WhatsApp Number   Phone             No                Defaults to primary
                                                        if same; used for
                                                        WA campaigns

  Email Address     Email             No                Validated format

  Lead Source       Dropdown          Yes               99acres,
                                                        MagicBricks,
                                                        Housing.com,
                                                        Facebook Ad, Google
                                                        Ad, Walk-in,
                                                        Referral, Cold
                                                        Call, Other

  Referral Name     Text              Conditional       Required if source
                                                        = Referral

  Assigned Agent    User lookup       Yes               Auto-assigned on
                                                        round-robin or
                                                        manual override

  Lead Created Date Date-time         Auto              System-generated,
                                                        immutable

  Last Contacted    Date-time         Auto              Updated on every
  Date                                                  logged interaction

  Next Follow-up    Date-time         Yes               Must be set before
  Date                                                  saving a call log

  Lead Status       Pipeline stage    Auto              Driven by pipeline
                                                        stage changes

  Lead Score        Calculated 1--100 Auto              AI-computed based
                                                        on profile
                                                        completeness,
                                                        engagement, budget
                                                        fit

  Tags              Multi-select      No                Custom labels: VIP,
                                                        NRI, Investor,
                                                        Resale, First-Time
                                                        Buyer

  Internal Notes    Rich text         No                Visible to agent
                                                        and above; not
                                                        visible to customer
  -------------------------------------------------------------------------

### **5.1.2 Real Estate Specific Fields**

  -----------------------------------------------------------------------
  **Field Name**          **Type**                **Values / Notes**
  ----------------------- ----------------------- -----------------------
  Property Type Interest  Multi-select            Apartment, Villa, Plot,
                                                  Row House, Commercial,
                                                  Shop, Warehouse

  Budget Range            Range picker (INR)      Min--Max in Lakhs;
                                                  e.g., 40L -- 70L

  Preferred Location /    Text + tag              Free text +
  Micro-Market                                    auto-suggest from
                                                  project list

  BHK Requirement         Multi-select            1 BHK, 1.5 BHK, 2 BHK,
                                                  2.5 BHK, 3 BHK, 3.5
                                                  BHK, 4 BHK, 4+ BHK

  Purpose of Purchase     Dropdown                Self-Use, Investment,
                                                  Both, Undecided

  Possession Preference   Dropdown                Ready-to-Move, Under
                                                  Construction, No
                                                  Preference

  Home Loan Required      Toggle                  Yes / No / Already
                                                  Pre-Approved

  Loan Pre-Approval       Currency                Shown only if
  Amount                                          pre-approved

  Current Residence       Dropdown                Owner, Tenant, Family
  Status                                          Owned

  Urgency of Purchase     Dropdown                Within 3 Months, 3--6
                                                  Months, 6--12 Months,
                                                  12+ Months

  Decision Maker          Dropdown                Self, Spouse Joint,
                                                  Family, Other

  Other Properties        Text                    Competitor projects
  Considered                                      under evaluation

  Project of Interest     Multi-select            Linked to active
                                                  projects in inventory
                                                  module

  Objections Raised       Multi-select + text     Price, Location,
                                                  Builder Reputation,
                                                  Project Delay, Family
                                                  Approval, Loan, Other
  -----------------------------------------------------------------------

### **5.1.3 Duplicate Lead Detection**

On lead creation, the system checks for existing records with the same
primary phone number or email. If a match is found, the agent is shown
the existing record with its current status and owner. The agent can
merge the record (if it\'s clearly the same person) or create a linked
secondary contact. Bulk import via CSV will flag duplicates pre-import
with a preview screen.

## **Module 2 --- Sales Pipeline & Lifecycle Management**

### **5.2.1 Pipeline Stages**

The pipeline uses a linear stage progression with two terminal states.
Every stage transition is timestamped and logged. Backdating is not
permitted. Managers can see how long a lead has been in any given stage.

  -----------------------------------------------------------------------
  **Stage**               **Definition**          **Auto-Trigger
                                                  Actions**
  ----------------------- ----------------------- -----------------------
  New Lead                Lead has been created   Assign to agent; create
                          but no contact attempt  first-call task within
                          made                    30 minutes

  Contacted               At least one successful Log call notes; set
                          conversation has        next follow-up
                          occurred                

  Interested              Customer has expressed  Lead score increases;
                          genuine interest in a   alert manager for
                          project                 high-value leads

  Site Visit Scheduled    Visit date and time     Send WhatsApp
                          confirmed with customer confirmation to
                                                  customer; create
                                                  pre-visit task for
                                                  agent

  Site Visit Done         Customer has visited    Trigger post-visit
                          the site                feedback form; create
                                                  follow-up task within
                                                  24 hours

  Negotiation             Price, payment plan, or Notify team leader;
                          unit selection under    lock lead to assigned
                          discussion              agent

  Booking / Token Paid    Customer has paid       Trigger congratulation
                          initial token amount    notification; initiate
                                                  booking checklist

  Closed --- Won          Final documentation and Archive lead; update
                          payment complete        inventory; generate
                                                  commission record

  Closed --- Lost         Customer has formally   Trigger lost-reason
                          declined or gone        capture form; add to
                          unresponsive for 60+    re-engagement pool
                          days                    after 90 days
  -----------------------------------------------------------------------

### **5.2.2 Pipeline Views**

-   Kanban Board View --- Drag-and-drop cards across pipeline stages.
    > Each card shows lead name, budget, last contacted date, lead
    > score, and next follow-up date. Color-coded urgency (green = on
    > track, amber = follow-up due today, red = overdue).

-   List View --- Sortable, filterable table view of all leads with
    > column customization. Ideal for bulk operations like reassignment.

-   Funnel View --- Shows aggregate count and conversion percentage at
    > each stage. Managers use this to identify bottlenecks.

## **Module 3 --- Follow-Up & Task Management**

  -----------------------------------------------------------------------
  *This module is the single biggest operational upgrade over the Google
  Sheet model. It creates a structured, enforced daily workflow for every
  agent and gives managers exception-based oversight --- they only need
  to act when something is wrong, not monitor everything constantly.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

### **5.3.1 Task Types**

-   Call Task --- Call this lead by \[date/time\]. Auto-created after
    > every logged interaction requiring a follow-up.

-   WhatsApp Task --- Send a specific message or document to this lead.

-   Site Visit Task --- Prepare for / escort customer on a site visit.

-   Document Collection Task --- Request and collect KYC or loan
    > documents.

-   Manager Review Task --- Escalated lead requiring manager attention
    > before proceeding.

### **5.3.2 Task Automation Rules**

  -----------------------------------------------------------------------
  **Trigger**             **Action**              **Assignee**
  ----------------------- ----------------------- -----------------------
  New lead created        Create first-call task  Assigned agent
                          due within 30 min       

  Call logged with no     Block save; force       Assigned agent
  follow-up date          follow-up date entry    

  Follow-up date passes   Mark task overdue; send Assigned agent
  with no activity        in-app alert            

  Overdue task \> 24      Escalation notification Team leader
  hours                   sent                    

  Overdue task \> 48      Lead flagged in manager Manager
  hours                   dashboard               

  Stage moved to Site     Create pre-visit        Assigned agent
  Visit Scheduled         checklist task          

  Stage moved to Site     Create 24-hour          Assigned agent
  Visit Done              follow-up task          

  Lead inactive for 30    Flag for re-engagement; Assigned agent +
  days (not Closed)       suggest AI message      manager alert
  -----------------------------------------------------------------------

### **5.3.3 Agent Daily Dashboard**

When an agent logs in, their first screen is a prioritized daily task
queue. This is not a raw list --- it is an AI-ranked queue ordered by
urgency and conversion probability. The agent sees: tasks overdue
(sorted by oldest first), tasks due today (sorted by lead score), and
tasks due this week (for advance planning). Each task item links
directly to the lead profile with one click.

## **Module 4 --- Role, Authority & Access Control**

### **5.4.1 Permission Matrix**

  --------------------------------------------------------------------------
  **Action**     **Agent**      **Team         **Admin /      **Super
                                Leader**       Manager**      Admin**
  -------------- -------------- -------------- -------------- --------------
  View own leads Yes            Yes            Yes            Yes

  View team      No             Yes            Yes            Yes
  leads                                                       

  View all leads No             No             Yes            Yes

  Create leads   Yes            Yes            Yes            Yes

  Edit lead      Own only       Team only      Yes            Yes
  details                                                     

  Delete lead    No             No             Yes            Yes

  Reassign lead  No             Team only      Yes            Yes

  Send WhatsApp  No             No             Yes            Yes
  campaign                                                    

  View reports   Own stats only Team reports   Full reports   Full reports

  Manage users   No             No             Yes            Yes

  Configure      No             No             No             Yes
  pipeline                                                    
  stages                                                      

  Access billing No             No             No             Yes
  / settings                                                  
  --------------------------------------------------------------------------

### **5.4.2 Lead Assignment Logic**

-   Manual Assignment --- Admin or manager assigns a lead to a specific
    > agent from lead profile or bulk select in list view.

-   Auto Round-Robin --- New leads from integrations (portal APIs,
    > Facebook Lead Ads) are distributed equally across active agents in
    > a team. Agents on leave are automatically excluded.

-   Capacity-Based Assignment --- Future enhancement. Routes leads to
    > agents with the fewest active hot leads.

-   Reassignment History --- Every reassignment is logged with
    > timestamp, from-agent, to-agent, and reason.

## **Module 5 --- WhatsApp Business API Integration**

  -----------------------------------------------------------------------
  *This is the highest-impact differentiator of this platform for the
  client. Their current inability to send professional, trackable
  WhatsApp messages is costing them deals. This module transforms
  WhatsApp from a personal communication tool into a managed marketing
  and nurturing channel.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

### **5.5.1 Integration Architecture**

The platform integrates with Meta\'s WhatsApp Business API (Cloud API
tier). The firm\'s registered WhatsApp Business number is connected once
during onboarding. All messages sent through the CRM are routed through
this number, maintaining a single professional identity. Message
templates must be pre-approved by Meta before use --- the system
includes a template submission workflow.

### **5.5.2 Message Types & Use Cases**

  -----------------------------------------------------------------------
  **Message Type**  **Use Case**      **Audience**      **Trigger**
  ----------------- ----------------- ----------------- -----------------
  Broadcast         New project       Segment of leads  Manual by manager
  Campaign          launch, price     (by stage,        
                    drop alert,       budget, interest) 
                    inventory update                    

  Automated Welcome Greet new lead    All new leads     Lead creation
                    immediately after with WA number    
                    creation                            

  Site Visit        Confirm visit     Leads in \'Site   Stage change
  Confirmation      date, time,       Visit Scheduled\' 
                    address, and                        
                    contact person                      

  Site Visit        Reminder 24 hours Leads in \'Site   Automated
  Reminder          and 2 hours       Visit Scheduled\' scheduled
                    before visit                        

  Follow-Up Nudge   Re-engage leads   Leads flagged as  AI suggestion +
                    that have gone    stale (30+ days)  manual confirm
                    quiet                               

  Document Request  Request KYC       Leads in          Manual by agent
                    documents, PAN,   Negotiation or    
                    Aadhar, etc.      Booking           

  Festive / Event   Diwali wishes,    All active leads  Manual by manager
  Message           special offers,   or segment        
                    event invites                       

  Booking           Congratulate and  Leads moved to    Stage change
  Confirmation      share next steps  Booking stage     automation
                    after booking                       
  -----------------------------------------------------------------------

### **5.5.3 Campaign Builder**

The campaign builder allows managers to create, preview, and schedule
WhatsApp broadcast campaigns. The workflow is: select audience segment
(filter by stage, budget range, property type, project interest, lead
score, tag, or custom criteria), choose a pre-approved message template,
personalize merge fields (customer name, project name, pricing), preview
a sample message, set send time (immediate or scheduled), and launch.
Post-send, the campaign dashboard shows delivery rate, read rate, and
reply rate per campaign.

### **5.5.4 Two-Way Messaging (Inbox)**

When a customer replies to any outbound WhatsApp message, the reply is
routed into the CRM\'s shared inbox. The assigned agent receives an
in-app notification and can respond directly from within the CRM ---
they never need to access WhatsApp on their personal phone for
professional communications. All conversation history is stored against
the lead profile. If a customer replies outside business hours, an
auto-response can be configured acknowledging receipt and providing a
callback timeframe.

## **Module 6 --- Site Visit Management**

### **5.6.1 Scheduling**

Site visits are scheduled from within the lead profile. The agent
selects a date, time, site location (from a dropdown of the firm\'s
active project sites), and names the agent or team member who will
escort the visit. The system checks for scheduling conflicts if the same
agent is being assigned two visits in the same time window.

### **5.6.2 Automated Communication**

-   Confirmation WhatsApp to customer immediately upon scheduling ---
    > includes date, time, site address, Google Maps link, and contact
    > number of escort.

-   Reminder WhatsApp to customer 24 hours before visit.

-   Reminder WhatsApp to customer 2 hours before visit.

-   Notification to escorting agent 1 hour before visit with customer
    > details.

### **5.6.3 Post-Visit Feedback**

Within 2 hours of the scheduled visit time, the agent receives a task to
complete the Post-Visit Feedback Form. This form captures: actual visit
status (Happened / Rescheduled / No-Show / Cancelled), customer reaction
(Very Interested / Somewhat Interested / Not Interested), specific units
or floors shown, objections raised during visit, agreed next step, and
follow-up date. This data feeds into reporting and AI recommendations.

## **Module 7 --- AI Integration Layer**

  -----------------------------------------------------------------------
  *AI features are additive --- they assist agents and managers but never
  act autonomously on lead data without human confirmation. Every AI
  suggestion can be accepted, modified, or dismissed with one click.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

### **5.7.1 AI Call Log Assistant**

After completing a call, the agent types or voice-dictates a brief raw
note into the CRM (e.g., \'he wants 2bhk budget is 55 lac interested in
towers b floor 4 onwards wife not convinced yet call after 10 days\').
The AI processes this note and returns a structured interaction record
with: a clean summary paragraph, extracted data fields (budget: 55L,
requirement: 2BHK, objection: spouse approval, preferred unit: Tower B
Floor 4+), suggested next follow-up date (today + 10 days), and a
recommended next action. The agent reviews, corrects if needed, and
saves. This replaces typing multiple form fields manually.

### **5.7.2 AI Lead Prioritization Engine**

Each morning, the system re-scores and re-ranks every agent\'s active
leads using a scoring model that weighs: recency of last interaction,
days since lead creation, current pipeline stage, budget match to
available inventory, follow-up task overdue status, WhatsApp message
read/reply signals, and post-visit feedback score. Agents see a ranked
daily call list --- not a flat alphabetical or date-sorted one --- with
a brief reasoning label for each lead (e.g., \'Overdue call --- was
interested in Tower B --- inventory running low\').

### **5.7.3 AI WhatsApp Message Generator**

When composing a WhatsApp message to a specific lead, the agent can
click \'Draft with AI.\' The AI reads the lead\'s full profile,
interaction history, property interest, objections, and current pipeline
stage, and generates a personalized message draft. The agent can edit
the draft before sending. This is particularly useful for re-engagement
messages where personalization significantly improves response rates.

### **5.7.4 AI Objection Handler**

During or after a call, the agent can type the objection the customer
raised into the Objection Handler tool. The AI returns 2--3 suggested
responses tailored to the real estate context, the customer\'s profile
(budget, purpose, urgency), and common counter-arguments used in Indian
residential real estate. Responses are editable scripts, not rigid
templates.

### **5.7.5 Stale Lead Re-Engagement Detector**

Every 48 hours, the system identifies leads that match these criteria:
last interaction older than 21 days, stage is Contacted or Interested
(not Lost), and no active task scheduled. These leads are surfaced to
the agent and manager with an AI-generated re-engagement message
suggestion and a confidence score indicating how likely the lead is to
re-engage based on similar historical lead behavior.

### **5.7.6 AI-Powered Lost Lead Analysis**

When a lead is marked Closed --- Lost, the agent must select a reason
(from the objection dropdown). Over time, the AI aggregates this data to
surface patterns: which objections are most common at which stage, which
lead sources produce the most lost leads, which agents have the highest
lost rate on specific objection types, and whether certain project
attributes correlate with loss. This insight feeds manager coaching and
campaign strategy.

## **Module 8 --- Reports & Analytics Dashboard**

### **5.8.1 Manager / Admin Dashboard**

The primary management interface. Loads in under 3 seconds and shows
real-time pipeline health. Key widgets include: total active leads by
stage (funnel visualization), leads added today vs. target, follow-up
compliance rate for each agent (% of tasks completed on time), overdue
follow-ups count with drill-down to list, new leads this week by source,
site visits scheduled this week and completion rate, and pipeline value
estimate (sum of budgets at each stage).

### **5.8.2 Agent Performance Report**

  -----------------------------------------------------------------------
  **Metric**              **Frequency**           **Visible To**
  ----------------------- ----------------------- -----------------------
  Total active leads      Real-time               Agent, Manager

  Calls logged today /    Real-time               Agent, Manager
  this week / this month                          

  Follow-up compliance    Daily                   Agent, Manager
  rate (%)                                        

  Lead stage progression  Weekly                  Manager
  rate                                            

  Site visits scheduled   Weekly                  Agent, Manager
  and completed                                   

  Conversion rate (Lead   Monthly                 Manager
  to Site Visit)                                  

  Conversion rate (Site   Monthly                 Manager
  Visit to Booking)                               

  Average time in each    Monthly                 Manager
  pipeline stage                                  

  WhatsApp response rate  Weekly                  Manager
  on their leads                                  
  -----------------------------------------------------------------------

### **5.8.3 Lead Source Analysis**

Shows which channels --- 99acres, MagicBricks, Facebook Ads, walk-ins,
referrals, cold calls --- are generating leads of highest quality.
Quality is measured by conversion to site visit and eventual booking
rate, not just lead volume. This report directly informs where the firm
should invest its marketing budget.

### **5.8.4 Pipeline Velocity Report**

Shows how long leads spend at each pipeline stage on average. Identifies
exactly where the bottleneck is --- whether it is converting Contacted
leads to Interested, or Interested leads to Site Visit, or Site Visit to
Negotiation. This is actionable intelligence that a Google Sheet can
never provide.

## **Module 9 --- Project & Inventory Management**

### **5.9.1 Project Master**

Each project the firm is selling is added to the system with: project
name, developer/builder name, location and Google Maps link, type
(residential, commercial, plotted), possession date, RERA registration
number, project brochure (PDF upload), pricing sheet (upload or
structured entry), and project amenities (multi-select).

### **5.9.2 Unit Inventory**

Within each project, individual units can be listed with: unit number,
tower, floor, type (1BHK / 2BHK etc.), carpet area, super built-up area,
base price, current status (Available / Blocked / Booked / Sold), and
blocked-by agent (if blocked). Agents can see live inventory
availability while pitching. Only managers can change status from
Blocked to Sold or revert a block.

### **5.9.3 Inventory Alerts**

-   Alert manager when a unit has been Blocked for more than 7 days
    > without moving to Booked --- prevents artificial blocking.

-   Alert agents interested in a specific unit when it becomes Available
    > again after a block is released.

-   Notify all agents when fewer than 5 units remain in a given
    > configuration (creates urgency talking point).

# **6. Non-Functional Requirements**

## **6.1 Performance**

-   Page load time: under 2 seconds for all primary views on a standard
    > 4G mobile connection

-   API response time: under 500ms for all read operations, under 1
    > second for write operations

-   WhatsApp message delivery: queued and dispatched within 60 seconds
    > of trigger

-   AI response time: call log processing under 5 seconds, message
    > generation under 8 seconds

-   Support concurrent use by up to 50 agents without degradation

## **6.2 Security & Compliance**

-   All data encrypted at rest (AES-256) and in transit (TLS 1.3)

-   JWT-based authentication with session expiry after 8 hours of
    > inactivity

-   Two-factor authentication (OTP via SMS) available for Admin and
    > above roles

-   Complete audit log of all data mutations --- who changed what, when,
    > from what value to what value

-   GDPR and Indian IT Act compliance for personal data storage and
    > processing

-   WhatsApp opt-in consent recorded and stored per lead --- only leads
    > who have opted in or explicitly responded to prior messages are
    > eligible for broadcasts

## **6.3 Scalability**

-   Architecture must support growth from 5 to 50 agents and 1,000 to
    > 100,000 leads without re-architecting

-   Multi-branch / multi-team support built into data model from day one
    > even if not exposed in MVP UI

-   API-first backend enabling future mobile apps or third-party
    > integrations

## **6.4 Reliability**

-   99.5% uptime SLA for production environment

-   Automated daily backups with 30-day retention

-   WhatsApp message delivery failure notifications with retry logic (3
    > attempts, 5-minute interval)

# **7. Proposed Technology Stack**

  -----------------------------------------------------------------------
  **Layer**               **Technology**          **Rationale**
  ----------------------- ----------------------- -----------------------
  Frontend                React.js + Tailwind CSS Fast, component-driven
                                                  UI; easy to build
                                                  data-rich dashboards
                                                  and Kanban views

  Backend / API           Node.js + Express.js    Efficient async
                                                  handling for real-time
                                                  events; large ecosystem
                                                  for WhatsApp
                                                  integrations

  Database                PostgreSQL (primary) +  Relational structure
                          Redis (cache/queues)    for complex
                                                  lead-agent-project
                                                  relationships; Redis
                                                  for task queues and
                                                  real-time alerts

  WhatsApp Integration    Meta Cloud API          Free tier available;
                          (WhatsApp Business API) supports templates,
                                                  two-way messaging,
                                                  media; no third-party
                                                  dependency

  AI Layer                OpenAI GPT-4o /         Best-in-class reasoning
                          Anthropic Claude API    for call log parsing,
                                                  message generation, and
                                                  objection handling

  Authentication          JWT + bcrypt + OTP via  Industry standard; OTP
                          Twilio/MSG91            via Indian SMS gateway
                                                  for reliability

  File Storage            AWS S3 / Cloudflare R2  Project brochures,
                                                  documents, profile
                                                  photos

  Hosting                 AWS EC2 / Railway (MVP) Cost-effective for MVP;
                          → ECS (scale)           containerized for easy
                                                  scaling

  Email Notifications     AWS SES / Resend        Transactional emails
                                                  for escalations and
                                                  reports

  Analytics               Custom dashboards (MVP) Full control on MVP;
                          → Metabase (post-MVP)   Metabase adds
                                                  self-serve reporting
                                                  later
  -----------------------------------------------------------------------

# **8. Phased Delivery Roadmap**

## **Phase 1 --- MVP Core (Weeks 1--6)**

  -----------------------------------------------------------------------
  *Goal: Replace Google Sheets entirely. Agents can manage leads, log
  calls, set follow-ups, and managers have visibility. This phase alone
  solves 70% of the client\'s problems.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

-   Lead creation, profile with all RE fields, duplicate detection

-   Pipeline stages with Kanban view

-   Task creation, follow-up tracking, overdue alerts

-   Role hierarchy --- Agent, Team Leader, Admin

-   Agent daily dashboard with task queue

-   Basic manager dashboard --- pipeline overview, follow-up compliance

-   Manual lead assignment and reassignment with history log

-   CSV import from existing Google Sheet with field mapping

-   Email notifications for overdue tasks and escalations

## **Phase 2 --- WhatsApp & Site Visits (Weeks 7--10)**

  -----------------------------------------------------------------------
  *Goal: Activate the marketing and nurturing channel. Add structured
  site visit management. This phase enables revenue-generating outreach
  at scale.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

-   WhatsApp Business API integration --- connect firm\'s WA Business
    > number

-   Template management --- create, submit for approval, and use
    > templates

-   Broadcast campaign builder with audience segmentation

-   Automated messages --- welcome, site visit confirmation, reminders

-   Two-way inbox for WhatsApp replies with agent routing

-   Site visit scheduling, automated comms, and post-visit feedback form

-   Delivery and read receipt tracking per campaign and per message

## **Phase 3 --- AI Layer (Weeks 11--14)**

  -----------------------------------------------------------------------
  *Goal: Make the platform intelligent. Reduce manual effort, surface the
  right actions automatically, and give agents superpowers in their
  conversations.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

-   AI call log assistant --- structured extraction from raw notes

-   AI lead scoring and daily prioritized call queue

-   AI WhatsApp message generator per lead

-   AI objection handler

-   Stale lead re-engagement detector with AI-suggested messages

## **Phase 4 --- Advanced Analytics & Inventory (Weeks 15--18)**

-   Project and inventory module with live unit status

-   Inventory alerts --- low stock, blocked unit timeout, availability
    > notification

-   Full reporting suite --- agent performance, lead source analysis,
    > pipeline velocity

-   Lost lead pattern analysis with AI insights

-   Mobile-optimized views for agents on the field

# **9. Risks & Mitigations**

  ----------------------------------------------------------------------------
  **Risk**          **Likelihood**    **Impact**        **Mitigation**
  ----------------- ----------------- ----------------- ----------------------
  Meta WhatsApp API Medium            High              Pre-submit standard
  approval delays                                       templates during
  for message                                           development; use test
  templates                                             environment. Have 3--4
                                                        templates ready for
                                                        immediate launch.

  Low user adoption High              High              Involve 2--3 agents in
  --- agents                                            UAT during
  resistant to new                                      development. Make
  tool                                                  first-week onboarding
                                                        hands-on. Keep UI
                                                        simpler than expected.

  Data migration    Medium            Medium            Build a
  errors from                                           preview-and-validate
  Google Sheet                                          import screen. Run
                                                        parallel operation for
                                                        2 weeks post-launch.

  AI response       Low               Medium            All AI outputs are
  quality                                               suggestions, not
  inconsistency                                         actions. Human review
                                                        always required before
                                                        save/send.

  WhatsApp spam     Low               Critical          Strict opt-in
  complaints                                            enforcement. Message
  leading to number                                     quality review before
  ban                                                   campaigns. Rate
                                                        limiting on
                                                        broadcasts.

  Scope creep       High              High              Hard freeze on Phase 1
  delaying MVP                                          scope. Any new
                                                        requests go into Phase
                                                        2+ backlog. Weekly
                                                        scope review with
                                                        stakeholders.
  ----------------------------------------------------------------------------

# **10. Open Questions & Decisions Required**

7.  Will the firm use a dedicated WhatsApp Business number for the CRM,
    > or their existing number? (Existing number migration has a complex
    > process and may have historical message loss.)

8.  Do agents need a mobile app (iOS/Android), or is a mobile-responsive
    > web app sufficient for Phase 1?

9.  What is the current Google Sheet structure? A schema review is
    > needed to define the import field mapping --- can a sample export
    > be shared?

10. Are there existing portal integrations (99acres, MagicBricks) with
    > lead auto-capture via API that should be connected in Phase 1 or
    > Phase 2?

11. Will the firm connect their Facebook Lead Ads account for direct
    > lead import, or will this be manual for now?

12. Who within the firm will serve as the Super Admin and primary point
    > of contact for UAT?

13. Is there a preference for data hosting geography --- India-based
    > servers (for compliance) or global cloud?

14. Are there commission tracking or revenue reporting requirements that
    > should be included in Phase 4?

# **11. Glossary**

  -----------------------------------------------------------------------
  **Term**                            **Definition**
  ----------------------------------- -----------------------------------
  Lead                                A prospective customer who has
                                      expressed or been identified as
                                      having potential interest in
                                      purchasing a property

  Pipeline Stage                      The defined position of a lead in
                                      the sales journey from first
                                      contact to booking

  Token / Booking Amount              The initial deposit paid by a buyer
                                      to reserve a specific unit ---
                                      legally binding intent to purchase

  BHK                                 Bedroom-Hall-Kitchen --- Indian
                                      standard for describing apartment
                                      size (1BHK, 2BHK, 3BHK)

  Micro-Market                        A specific sub-area within a city
                                      that has distinct pricing and
                                      demand characteristics

  RERA                                Real Estate Regulatory Authority
                                      --- mandatory registration for
                                      projects; RERA number is proof of
                                      compliance

  Carpet Area                         The actual usable floor area within
                                      the walls of the apartment --- what
                                      the customer actually gets

  Super Built-Up Area                 Carpet area + proportionate share
                                      of common areas --- the area on
                                      which pricing is typically quoted

  WhatsApp Business API               Meta\'s official API for businesses
                                      to send WhatsApp messages at scale,
                                      distinct from the personal WhatsApp
                                      app

  Broadcast Campaign                  A WhatsApp message sent
                                      simultaneously to a curated list of
                                      leads --- not a group chat

  Round-Robin Assignment              Systematic, equal distribution of
                                      incoming leads across all available
                                      agents in rotation

  Lead Score                          A calculated 1--100 rating
                                      indicating how likely a lead is to
                                      convert, based on profile
                                      completeness and engagement signals

  Stale Lead                          A lead that has had no logged
                                      interaction for 21 or more days and
                                      has not been marked as Lost

  Objection                           A stated concern or barrier raised
                                      by the customer that prevents them
                                      from moving forward in the purchase
                                      decision
  -----------------------------------------------------------------------

# **12. Document Sign-Off**

This PRD represents the agreed product specification for SA Reality CRM
v1.0. Any changes to scope, timeline, or technical approach after
sign-off require a formal change request with stakeholder approval.

  -----------------------------------------------------------------------
  **Role**          **Name**          **Signature**     **Date**
  ----------------- ----------------- ----------------- -----------------
  Product Owner                                         

  Engineering Lead                                      

  Client                                                
  Stakeholder                                           

  Design Lead                                           
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  *End of Document --- SA Reality CRM PRD v1.0 --- February 2026 ---
  Confidential*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
