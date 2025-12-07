# User Stories

## User Context

**User:** Doctor in private practice in Mexico

**Main objective:** Create clinical notes and manage patient records

**Pain points:** Current software is slow, ugly, unintuitive, and hinders daily work

**Compliance requirements:** NOM-004 (Clinical Record), NOM-024 (Health Information Systems)

---

# 1. Access

## Story 1.1: First access to the system

**As** a doctor

**I want** to access the system directly and see the main dashboard immediately

**So that** I can start working right away, since my profile was already validated and configured by the sales team

**Interaction flow:**

1. When I open the system, it automatically verifies my access credentials (keys assigned by sales team)

2. If my access is valid, I'm immediately taken to the main dashboard

3. My profile information is already complete and visible (validated by sales team)

4. I can start using the system immediately without any setup steps

**Design considerations:**

- The transition to the dashboard must be fast and seamless (less than 2 seconds)

- The design must look professional and medical, not like a consumer app

- It must convey security and confidentiality (sober colors, clear typography)

- There should be no onboarding screens or setup wizards

- If access is not configured, there must be clear contact information for the sales team

- The doctor's profile information should be visible but not editable (except possibly profile photo)

**Priority:** High

---

## Story 1.2: Automatic access with assigned keys

**As** a doctor

**I want** the system to automatically recognize my access when I open it

**So that** I can start working immediately without authentication steps, since my access was already configured by the sales team

**Interaction flow:**

1. When I open the system, it automatically verifies my access credentials (keys assigned by sales team)

2. If my access is valid, I'm immediately taken to the main dashboard

3. If there's an issue with my access, I see a clear message explaining the situation

4. I see contact information for the sales team if I need to resolve access issues

5. Once access is confirmed, I can use the system normally

**Design considerations:**

- Access verification must be fast and seamless (less than 2 seconds)

- There should be no visible login forms or authentication steps for the user

- If access is not configured, the message must be clear and helpful, with direct contact information

- The system must handle access errors gracefully without exposing technical details

- There must be a clear indicator that access is being verified (subtle loading indicator)

- The transition to the dashboard must be smooth and immediate once access is confirmed

**Priority:** High

---

## Story 1.3: Update profile photo (optional)

**As** a doctor

**I want** to update my profile photo if I want to personalize my account

**So that** I can have a recognizable photo in my profile

**Interaction flow:**

1. In my profile section, I see my current profile photo (or a placeholder if none is set)

2. I see an "Edit photo" or "Change photo" button

3. When I click, I can upload a new photo from my device

4. I can crop or adjust the photo if needed

5. When I save, the new photo is updated and visible in my profile

**Design considerations:**

- The profile photo section must be clearly visible but not intrusive

- The photo upload must be simple and fast

- There should be clear size/format requirements (if any)

- The edit option should be visible but not too prominent (since it's optional)

- All other profile information (name, specialty, license, etc.) should be visible but clearly marked as read-only, since it was validated by the sales team

- If photo editing is not available, this story can be skipped entirely

**Priority:** Low

---

# 2. Main Dashboard

## Story 2.1: Overview of consultation day

**As** a doctor

**I want** to immediately see a summary of my work day when entering the system

**So that** I can quickly know which patients I have scheduled and what I need to do

**Interaction flow:**

1. When I access the system, I see the main dashboard with today's date highlighted at the top

2. I see a "Today's patients" section with a list of scheduled patients, showing: name, appointment time, and reason for visit

3. I see a visible counter that says "X patients scheduled" and "Y patients seen"

4. I see quick action buttons: "New patient", "New clinical note", "Search patient"

5. In the top right, I always see my name and a button to sign out

**Design considerations:**

- The most important information (today's patients) must be at the top and be the first thing seen

- Patients must be ordered by appointment time

- There must be a clear visual indicator of which patients have already been seen (green checkmark, for example)

- The design must be clean, without unnecessary distracting information

- It must load quickly (less than 3 seconds)

- If there are no scheduled patients, it must show a friendly message and a button to add one

**Priority:** High

---

## Story 2.2: Quick access to most frequent actions

**As** a doctor

**I want** to have large and visible buttons for the actions I do most often

**So that** I don't have to search through menus and can work faster

**Interaction flow:**

1. On the dashboard, I see a quick actions bar with large icons and clear text

2. The main buttons are: "New patient", "Search patient", "New note", "View records"

3. When I click on any of them, I'm taken directly to that function without intermediate steps

4. The buttons have different colors to differentiate them visually

**Design considerations:**

- Buttons must be large enough to click easily (minimum 44x44px)

- They must have clear icons and descriptive text

- Colors must be consistent throughout the system

- They must always be visible, even when scrolling

- The most used button ("New clinical note") must be the most prominent

**Priority:** High

---

## Story 2.3: Critical information always visible

**As** a doctor

**I want** to see important information for the day without having to navigate to other screens

**So that** I'm always aware of my workload and don't miss important information

**Interaction flow:**

1. On the dashboard, I always see at the top: current date, my name, and an indicator of how many patients are left to see

2. I see a numerical summary: "Total patients today: X", "Seen: Y", "Pending: Z"

3. If there are patients with upcoming appointments (next 30 minutes), I see a highlighted alert with their names

4. I see quick access to the last 3 patients I consulted, with their names and date of last consultation

**Design considerations:**

- Critical information must be at the top of the screen

- Important numbers must be in large size and easy to read

- Alerts must be visible but not intrusive (yellow/orange color, not red unless urgent)

- The design must allow seeing all this information without scrolling

- If there's no information to show, there must be a clear message instead of empty spaces

**Priority:** High

---

## Story 2.4: Clear navigation between sections

**As** a doctor

**I want** to have a clear and always accessible navigation menu

**So that** I can move easily between different parts of the system without getting lost

**Interaction flow:**

1. I see a side or top menu with main sections: Dashboard, Patients, Records, Notes, Settings

2. The section I'm currently in is highlighted or marked differently

3. When I click on any section, I change views immediately

4. The menu is always visible, it doesn't hide when scrolling

**Design considerations:**

- The menu must be clear and have icons that help identify each section

- There must be a maximum of 5-7 main options to avoid overwhelming

- The active section must be clearly marked (different color, underline, etc.)

- The menu must be responsive and work well on different screen sizes

- There must be quick access to profile and sign out, typically in the top right corner

**Priority:** Medium

---

# 3. Search and Access to Records

## Story 3.1: Quickly search patient by name

**As** a doctor

**I want** to find a patient by typing their name in a search box

**So that** I can access their record in seconds without having to search through long lists

**Interaction flow:**

1. I see a large and prominent search field at the top of the patients screen

2. I type the patient's name (or part of the name) and see results in real time as I type

3. Results appear in a list below the search box, showing: full name, age, last consultation

4. I click on the patient I'm looking for and access their record directly

5. If there are no results, I see a clear message "No patients found"

**Design considerations:**

- The search field must have a visible magnifying glass icon

- It must have a clear placeholder: "Search by name, ID or date..."

- Results must appear as I type (real-time search), with a minimum delay of 300ms to avoid overloading

- Results must be easy to read, with sufficient space between each option

- It must work with partial names (if I type "John", it must find "John Smith" and "John Carlos")

- If there are many results, it must show the first 10-15 and a "Show more results" message

**Priority:** High

---

## Story 3.2: Search patient by record number or ID

**As** a doctor

**I want** to search for a patient using their record number or unique ID

**So that** I can find patients when I don't remember their full name or there are patients with similar names

**Interaction flow:**

1. In the search field, I type the patient's record number or ID

2. The system automatically recognizes that it's a number and searches by that criteria

3. If it finds the patient, it shows them highlighted with their complete information

4. I click and access their record directly

**Design considerations:**

- The search must be intelligent and recognize if I'm typing a name or a number

- It must clearly show the patient's ID/record in the search results

- If the number doesn't exist, it must show a clear message "No record found with that number"

- The number format must be consistent (e.g.: EXP-2024-00123)

**Priority:** Medium

---

## Story 3.3: View complete patient list

**As** a doctor

**I want** to see an organized list of all my patients

**So that** I have a general view and can access any record when needed

**Interaction flow:**

1. In the "Patients" section, I see a table or list with all patients

2. Each row shows: full name, age, last consultation, record number

3. I can sort the list by clicking on column headers (by name, by date, etc.)

4. I can click on any patient to see their complete record

5. I see a "New patient" button always visible at the top

**Design considerations:**

- The list must be easy to read, with alternating row colors to facilitate reading

- There must be pagination if there are many patients (show 20-30 per page)

- Column headers must be clear and clickable to sort

- There must be a visual indicator of sort direction (up/down arrow)

- The list must load quickly, even with many patients

- There must be a visible filter to reduce the list (by date, by name, etc.)

**Priority:** High

---

## Story 3.4: Access patient's complete record

**As** a doctor

**I want** to see all patient information in a single organized view

**So that** I have complete context before creating a new note or making medical decisions

**Interaction flow:**

1. From the search or list, I click on a patient

2. I see a screen with tabs or sections: "General information", "Clinical history", "Notes", "Exams"

3. General information shows: name, age, date of birth, contact, allergies, chronic diseases

4. History shows a timeline with all previous consultations

5. I can click on any previous note to see it completely

6. I see a prominent "New clinical note" button for this patient

**Design considerations:**

- Critical information (allergies, important diseases) must be highlighted and immediately visible

- The design must be clean and organized, without overwhelming with information

- Tabs or sections must be clear and easy to navigate

- Information must be organized from most recent to oldest

- There must be a clear "Back" button to return to the patient list

- The "New note" button must be large and always visible

**Priority:** High

---

# 4. Clinical Note Creation

## Story 4.1: Create clinical note during consultation (quick flow)

**As** a doctor

**I want** to create a clinical note quickly and simply while attending to the patient

**So that** I don't waste time in the process and can focus on medical care

**Interaction flow:**

1. From the patient's record or from the dashboard, I click on "New clinical note"

2. I see a clean form with clear sections: Reason for visit, Physical examination, Diagnosis, Treatment

3. The most important fields are at the top and easy to fill

4. I can write freely or use predefined templates to speed up the process

5. I see a large and visible "Save" button at the bottom

6. When I save, I see a confirmation and automatically return to the patient's record

**Design considerations:**

- The form must be simple and not overwhelming

- Fields must have sufficient space to write

- It must save automatically at regular intervals (autosave) to avoid losing information

- The save button must always be visible, even when scrolling

- There must be clear validation: required fields marked and specific error messages

- The complete process should not take more than 2-3 minutes for a standard consultation

- There must be a "Cancel" button visible but less prominent

**Priority:** High

---

## Story 4.2: Use templates for common notes

**As** a doctor

**I want** to use predefined templates for common types of consultations

**So that** I save time writing repetitive information and maintain consistency in my notes

**Interaction flow:**

1. When creating a new note, I see a "Use template" button near the start of the form

2. When I click, I see a list of available templates: "General consultation", "Diabetes control", "Postoperative review", etc.

3. I select a template and the form automatically fills with predefined fields

4. I can edit and customize any field according to the patient's specific situation

5. I can save my own custom templates to use later

**Design considerations:**

- Templates must be easy to find and select

- There must be common predefined templates, but also the option to create your own

- When using a template, it must be clear which fields are from the template and which are customized

- It must be easy to exit the template and return to the blank form if I change my mind

- Templates must be editable and not block customization

**Priority:** Medium

---

## Story 4.3: Capture essential consultation data

**As** a doctor

**I want** to capture all essential consultation information in an organized way

**So that** I comply with legal requirements and have a complete record of the medical encounter

**Interaction flow:**

1. The clinical note form has sections clearly separated visually

2. First I fill: Consultation date and time (automatically pre-filled), Reason for visit

3. Then: Physical examination (vital signs, findings), Diagnosis (with option to search ICD-10 codes)

4. Finally: Treatment (medications, dosage, instructions), Follow-up plan

5. Each section has required fields clearly marked with asterisk (*)

6. I can navigate between sections easily and see which sections are complete

**Design considerations:**

- Required fields must be clearly marked

- There must be real-time validation that alerts me if something important is missing

- Information must save automatically to avoid losing it

- The form must be responsive and work well on tablets (many doctors use tablets in consultation)

- There must be contextual help: information icons that explain what goes in each field

- Long text fields (like physical examination) must have sufficient space

- There must be medication dosage validation (alerts if it seems incorrect)

**Priority:** High

---

## Story 4.4: Save and validate clinical note

**As** a doctor

**I want** to save my clinical note with automatic validation of required fields

**So that** I ensure I comply with legal requirements and don't forget important information

**Interaction flow:**

1. When I click "Save", the system automatically validates all required fields

2. If something is missing, I see a clear message indicating which fields are missing, with links that take me directly to those fields

3. Missing fields are highlighted in red so I can identify them quickly

4. Once complete, when I save I see a confirmation message: "Clinical note saved successfully"

5. The note is registered with date and time, and I'm redirected to the patient's record where I can see the new note

**Design considerations:**

- Validation must be clear and specific, not generic

- Error messages must be helpful: "The 'Diagnosis' field is required" not just "Error"

- There must be a visual progress indicator: "3 of 5 sections complete"

- Saving must be fast (less than 2 seconds)

- There must be a "Saving..." indicator while processing

- Once saved, it must be clear that the action was successful

- It must not allow closing or navigating away without saving if there are unsaved changes (with warning)

**Priority:** High

---

## Story 4.5: View and edit recent notes

**As** a doctor

**I want** to be able to view and correct a note I just created if I noticed an error

**So that** I maintain accuracy in medical records and correct errors quickly

**Interaction flow:**

1. After saving a note, I see a visible "Edit note" button in the note view

2. When I click, I can modify any field in the note

3. Changes are saved with a new timestamp and it's recorded that it was edited

4. I can see the edit history if necessary

5. When I save the changes, I see confirmation and the updated note

**Design considerations:**

- It must be easy to identify which notes are editable (recent notes) and which are read-only (old notes)

- There must be a reasonable time limit for editing (e.g.: notes from the last 24 hours)

- Edits must be recorded for audit (legal requirement)

- The edit button must be visible but not intrusive

- There must be a clear warning if I try to edit an old note (may require special permissions)

**Priority:** Medium

---

# 5. Patient History Visualization

## Story 5.1: View all patient's previous notes

**As** a doctor

**I want** to see a chronological list of all the patient's previous consultations

**So that** I understand the complete medical history and see the evolution of the case

**Interaction flow:**

1. In the patient's record, I see a "Clinical history" or "Previous notes" section

2. I see a list ordered from most recent to oldest, showing: date, reason for visit, main diagnosis

3. Each note is a clickable element that shows a summary

4. When I click on a note, I see the complete content in an expanded view or in a new section

5. I can close the detailed view and return to the list

**Design considerations:**

- The list must be easy to read, with sufficient space between each note

- There must be a visual date indicator (e.g.: "2 weeks ago", "1 month ago")

- Most recent notes must be highlighted or easier to access

- There must be a search box within the history to find specific notes by date or diagnosis

- The detailed view must be clear and easy to read, with the same format as new notes

- It must load quickly even with many years of history

**Priority:** High

---

## Story 5.2: View patient's medical timeline

**As** a doctor

**I want** to see a visual timeline of the patient's medical history

**So that** I quickly understand the evolution of their condition and important milestones

**Interaction flow:**

1. In the record, I see a "Timeline view" option

2. I see a vertical line with dates, and each consultation/medical event appears as a point on the line

3. When I click on a point, I see a summary: date, diagnosis, main treatment

4. I can expand any point to see complete details

5. Important events (surgeries, critical diagnoses) are visually highlighted

**Design considerations:**

- The timeline must be visually clear and easy to follow

- There must be zoom or filters to view different periods (last month, last year, all)

- Important events must have different icons or colors

- It must be responsive and work well on different screen sizes

- Information must be concise in the timeline view, with option to expand for details

- It must load progressively if there's a lot of history (not all at once)

**Priority:** Medium

---

## Story 5.3: View highlighted relevant information

**As** a doctor

**I want** to immediately see the most important patient information (allergies, chronic diseases, current medications)

**So that** I make informed medical decisions without having to search through the entire history

**Interaction flow:**

1. When I open the patient's record, I see a highlighted section at the top with critical information

2. I see visible boxes or cards with: "Allergies", "Chronic diseases", "Current medications", "Previous surgeries"

3. This information is always visible, even when scrolling through the history

4. If there's critical information (e.g.: severe allergy), it's highlighted in red or with an alert icon

5. I can click on any element to see more details or edit

**Design considerations:**

- Critical information must be at the top and impossible to miss

- It must use colors and icons to convey urgency/importance (red for allergies, yellow for warnings)

- It must be concise but complete: show the essentials, with option to expand

- This section must be "fixed" or always accessible, not get lost when scrolling

- The design must be clear and not overwhelming, using well-organized cards or boxes

- If there's no information in a category, it must show "None recorded" instead of leaving it empty

**Priority:** High

---

## Story 5.4: Search specific information in history

**As** a doctor

**I want** to search for specific information within the patient's history (by diagnosis, medication, date)

**So that** I quickly find relevant consultations or treatments without reading the entire history

**Interaction flow:**

1. In the history section, I see a search field specific to the history

2. I can search by: keyword, diagnosis, medication, or date range

3. Results filter in real time showing only notes that match

4. I can click on any result to see the complete note

5. I can easily clear the filter to see the entire history again

**Design considerations:**

- The search box must be visible and easy to find

- It must have advanced filter options but not overwhelming

- Filtered results must be clear: "Found 3 notes matching 'diabetes'"

- It must highlight searched words in results

- It must be fast, even with a lot of history

- There must be a clear "Clear filters" button to return to the complete view

**Priority:** Medium

---

# 6. Patient Management

## Story 6.1: Register a new patient

**As** a doctor

**I want** to register a new patient quickly and simply

**So that** I can create their record and start working with them immediately

**Interaction flow:**

1. From the dashboard or patient list, I click the "New patient" button

2. I see a form with sections: Personal information, Contact, Basic medical information

3. Required fields are marked: Full name, Date of birth, Sex

4. Optional fields (phone, email, address) I can fill later

5. When I save, the system automatically generates a unique record number

6. I see confirmation and am taken directly to the new patient's record where I can create the first note

**Design considerations:**

- The form must be short and focused on the essentials to start

- It must allow saving with minimal information and completing later

- The generated record number must be visible and easy to remember/copy

- There must be clear validation: date format, age calculated automatically

- The "Save" button must always be visible

- There must be a "Cancel" button to exit without saving (with confirmation if data has been entered)

- The complete process should not take more than 2 minutes for basic information

**Priority:** High

---

## Story 6.2: Edit patient information

**As** a doctor

**I want** to update an existing patient's information when it changes (phone, address, etc.)

**So that** I keep data updated and can contact them when necessary

**Interaction flow:**

1. In the patient's record, I see an "Edit information" button in the personal data section

2. When I click, the form becomes editable with current data pre-filled

3. I can modify any field (except record number which is permanent)

4. Changes are saved and I see confirmation

5. History of important changes is recorded (for audit)

**Design considerations:**

- It must be clear which fields are editable and which are not (record number, creation date)

- Changes must be saved securely and recorded

- There must be validation to ensure data remains correct

- The edit button must be visible but not intrusive

- It must be easy to cancel changes if I change my mind

- Edited fields must have some subtle visual indicator

**Priority:** Medium

---

## Story 6.3: View and organize patient list

**As** a doctor

**I want** to see my patients organized in different ways (by name, by last consultation, by diagnosis)

**So that** I quickly find the patients I need and manage my list efficiently

**Interaction flow:**

1. In the "Patients" section, I see a list with organization options

2. I can sort by: Name (A-Z), Last consultation date, Registration date, Active diagnosis

3. I can filter by: Active patients, Inactive patients, By date range

4. I see the total number of patients and how many match the applied filters

5. I can click on any patient to see their record

**Design considerations:**

- Sort and filter controls must be clear and easy to use

- There must be visual indicators of which filters are active

- The list must update quickly when changing filters

- There must be a "Clear filters" button to return to the default view

- Pagination must be clear if there are many patients

- There must be an integrated search box that works together with filters

**Priority:** Medium

---

## Story 6.4: Archive or deactivate patients

**As** a doctor

**I want** to be able to archive patients I no longer actively see

**So that** I keep my patient list organized and focused on active patients

**Interaction flow:**

1. In the patient list or in the record, I see an "Archive patient" or "Mark as inactive" option

2. When I select it, I see a confirmation asking if I'm sure

3. The patient moves to an "Archived patients" list but their information is maintained

4. I can see archived patients in a separate section if I need them

5. I can reactivate an archived patient at any time

**Design considerations:**

- The archive option must not be too prominent (to avoid errors)

- There must be a clear confirmation before archiving

- Archived patients must be clearly marked as such

- It must be easy to find and reactivate archived patients if necessary

- Archiving must not delete information, only hide it from the main view

- There must be an optional reason for archiving (e.g.: "Patient moved", "Deceased") for record

**Priority:** Low

---

## Story 6.5: View quick patient summary in list

**As** a doctor

**I want** to see relevant information for each patient directly in the list

**So that** I quickly identify patients and know their status without opening each record

**Interaction flow:**

1. In the patient list, each row shows: name, age, last consultation, main active diagnosis

2. If there's critical information (severe allergy), I see an alert icon next to the name

3. I can see a visual indicator of when the last consultation was (color: green if recent, gray if long ago)

4. When I hover over a patient, I see a tooltip with additional quick information

5. I can click to see the complete record

**Design considerations:**

- The information shown must be useful but not overwhelming

- Alert icons must be clear and consistent

- The design must allow quickly scanning the list

- Colors must have meaning (green = active/recent, red = alert, gray = inactive)

- The list must be responsive and work well on different devices

- There must be sufficient space between rows to facilitate reading

**Priority:** Medium

---

# 7. Appointments and Scheduling

## Story 7.1: Create appointment from patient profile

**As** a doctor

**I want** to create an appointment directly from a patient's profile

**So that** I can quickly schedule follow-up visits or consultations while reviewing their record

**Interaction flow:**

1. In the patient's record, I see a prominent "Schedule appointment" or "New appointment" button

2. When I click, I see a form with: Date, Time, Duration, Reason for appointment, Notes (optional)

3. The patient's information is pre-filled and visible (name, contact)

4. I can select a date from a calendar picker and choose an available time slot

5. I see a confirmation of the appointment details before saving

6. When I save, the appointment is created and I see a confirmation message

7. The appointment appears in my calendar view

**Design considerations:**

- The button to create appointment must be easily accessible from the patient profile

- The form must be simple and quick to fill (should take less than 1 minute)

- The calendar picker must show available time slots clearly

- There must be validation to prevent double-booking or scheduling conflicts

- The date/time selection must be intuitive and fast

- If there are scheduling conflicts, they must be clearly highlighted

- The appointment should be immediately visible in the calendar after creation

**Priority:** High

---

## Story 7.2: View calendar and daily schedule

**As** a doctor

**I want** to see my calendar with all scheduled appointments

**So that** I can manage my daily schedule and see what patients I have coming up

**Interaction flow:**

1. I access the "Calendar" or "Appointments" section from the main navigation

2. I see a calendar view (month, week, or day view) with all my appointments

3. Each appointment shows: Patient name, Time, Duration, Reason for visit

4. I can switch between different views (day, week, month) easily

5. I can click on any appointment to see more details or edit it

6. Today's appointments are highlighted or shown in a separate "Today" section

7. I can see upcoming appointments for the next few days at a glance

**Design considerations:**

- The calendar must load quickly and be easy to navigate

- The default view should show the current day or week

- Appointments must be clearly visible with sufficient information

- The calendar must be responsive and work well on tablets (many doctors use tablets)

- There must be color coding or visual indicators for different types of appointments (if applicable)

- The current date/time must be clearly marked

- It must be easy to see which time slots are available vs. booked

- The calendar should integrate seamlessly with the patient records

**Priority:** High

---

## Story 7.3: Edit or cancel appointments

**As** a doctor

**I want** to modify or cancel appointments when needed

**So that** I can manage schedule changes and keep my calendar accurate

**Interaction flow:**

1. In the calendar view, I click on an appointment

2. I see the appointment details with options to "Edit" or "Cancel"

3. When I click "Edit", I can modify: Date, Time, Duration, Reason, Notes

4. When I click "Cancel", I see a confirmation dialog asking if I'm sure

5. I can optionally add a reason for cancellation

6. After saving changes or canceling, I see confirmation and the calendar updates

7. If I cancel, the time slot becomes available again

**Design considerations:**

- Editing must be simple and fast

- Cancellation must require confirmation to avoid accidental deletions

- There should be an option to notify the patient (if applicable in the system)

- Changes must be immediately reflected in the calendar

- The edit form should be similar to the create form for consistency

- There must be clear visual feedback when an appointment is canceled

**Priority:** Medium

---

## Story 7.4: View appointment details and patient context

**As** a doctor

**I want** to see detailed information about an appointment and quickly access the patient's record

**So that** I can prepare for the consultation and have context readily available

**Interaction flow:**

1. In the calendar, I click on an appointment

2. I see a detailed view showing: Patient name, Date and time, Duration, Reason, Notes, Patient contact information

3. I see a quick link or button to "View patient record"

4. When I click, I'm taken directly to the patient's full record

5. I can see the patient's last consultation, current medications, and important notes

6. I can return to the calendar easily

**Design considerations:**

- The appointment detail view must show all relevant information clearly

- The link to patient record must be prominent and easy to access

- The transition between calendar and patient record must be smooth

- Patient information must be clearly organized and easy to scan

- There should be quick access to create a clinical note for this appointment

- The design must allow quick navigation back to the calendar

**Priority:** Medium

---

# 8. Compliance Dashboard

## Story 8.1: View compliance metrics overview

**As** a doctor

**I want** to see an automated dashboard with compliance metrics for NOM-004 and NOM-024

**So that** I can quickly understand my compliance status and identify areas that need attention

**Interaction flow:**

1. I access the "Compliance" section from the main navigation

2. I see a dashboard with key compliance metrics displayed prominently

3. I see separate sections or tabs for NOM-004 and NOM-024 compliance

4. Each section shows: Overall compliance percentage, Status indicators (compliant/at risk/non-compliant), Number of issues or gaps

5. I see visual indicators (colors, icons) that make it easy to understand status at a glance

6. The metrics are automatically calculated and updated in real-time

7. I can see trends over time (compliance over last month, quarter, etc.)

**Design considerations:**

- The dashboard must load quickly and be easy to understand

- Visual indicators must be clear: green for compliant, yellow for at risk, red for non-compliant

- The metrics must be automatically calculated - no manual input required from the doctor

- The information must be presented in a way that's not overwhelming

- Key metrics should be prominently displayed at the top

- The design must look professional and trustworthy (important for compliance)

- There should be tooltips or help icons explaining what each metric means

- The dashboard should be responsive and work on different screen sizes

**Priority:** High

---

## Story 8.2: View detailed compliance breakdown

**As** a doctor

**I want** to see detailed breakdown of compliance requirements and my status for each

**So that** I can understand exactly what needs to be addressed to maintain compliance

**Interaction flow:**

1. In the compliance dashboard, I click on a specific compliance area (NOM-004 or NOM-024)

2. I see a detailed list of all compliance requirements for that standard

3. Each requirement shows: Requirement description, My current status, What's missing (if non-compliant), Last updated date

4. I can expand any requirement to see more details and recommendations

5. I see which requirements are met, which are at risk, and which are non-compliant

6. I can filter or sort requirements by status

7. I see actionable recommendations for improving compliance

**Design considerations:**

- The detailed view must be well-organized and easy to navigate

- Requirements must be clearly explained in understandable language

- Status indicators must be consistent and clear

- The list must be scannable - easy to quickly see what needs attention

- There should be search or filter functionality if there are many requirements

- Non-compliant items should be highlighted and easy to identify

- Recommendations should be specific and actionable

- The information must be automatically updated based on system data

**Priority:** High

---

## Story 8.3: View compliance alerts and notifications

**As** a doctor

**I want** to be notified when there are compliance issues or risks

**So that** I can address them promptly and avoid compliance problems

**Interaction flow:**

1. In the compliance dashboard, I see an "Alerts" or "Issues" section

2. I see a list of current compliance issues that need attention

3. Each alert shows: Type of issue, Severity (critical/warning/info), Affected requirement, Recommended action

4. Critical issues are highlighted at the top

5. I can click on an alert to see detailed information and how to resolve it

6. I can mark alerts as "Reviewed" or "Resolved" when I've addressed them

7. I see a count of unresolved alerts in the navigation or dashboard header

**Design considerations:**

- Alerts must be clearly visible but not intrusive

- Critical alerts must be impossible to miss (red color, prominent placement)

- The alert system must be automated based on compliance checks

- Alerts should be actionable - not just informational

- There should be a way to filter alerts by severity or type

- Resolved alerts should be archived but accessible for review

- The alert count should be visible but not distracting

- Alerts should link directly to the relevant compliance requirement

**Priority:** High

---

## Story 8.4: View compliance reports and history

**As** a doctor

**I want** to see historical compliance data and generate reports

**So that** I can track my compliance over time and demonstrate compliance for audits

**Interaction flow:**

1. In the compliance section, I see a "Reports" or "History" tab

2. I can view compliance metrics over different time periods (last month, quarter, year)

3. I see charts or graphs showing compliance trends

4. I can generate compliance reports for specific periods

5. Reports show: Overall compliance percentage, Breakdown by requirement, Issues and resolutions, Timeline of changes

6. I can export reports (PDF, Excel) if needed for audits or documentation

7. I can see when compliance issues were identified and resolved

**Design considerations:**

- Reports must be professional and suitable for audits

- Charts and graphs must be clear and easy to understand

- The report generation must be fast and simple

- Export options must be clearly available

- Historical data must be accurate and complete

- The reports must automatically include all relevant compliance information

- The design must look official and trustworthy

- Reports should be printable and well-formatted

**Priority:** Medium

---

## Story 8.5: Understand compliance requirements

**As** a doctor

**I want** to understand what each compliance requirement means and how to meet it

**So that** I can ensure I'm following the regulations correctly

**Interaction flow:**

1. In the compliance dashboard, I see help icons or "Learn more" links next to each requirement

2. When I click, I see detailed information about: What the requirement means, Why it's important, How the system helps me meet it, Examples of compliant vs. non-compliant practices

3. I can access a glossary or reference section explaining compliance terms

4. I see links to official NOM-004 and NOM-024 documentation (if applicable)

5. The information is presented in clear, non-technical language

**Design considerations:**

- Help information must be easily accessible but not intrusive

- Explanations must be clear and use simple language (not overly legal or technical)

- Examples must be relevant to the doctor's daily practice

- The help content must be well-organized and searchable

- There should be visual aids or examples when helpful

- The information should focus on practical application, not just theory

- Help should be contextual - available where it's needed

**Priority:** Low

---

# General Design Considerations

## Design Principles for the Entire System

### Speed and Efficiency
- All common actions must be completed in less than 3 clicks
- Screens must load in less than 3 seconds
- There must be autosave to avoid losing information
- Main action buttons must be large and easy to click

### Clarity and Simplicity
- The design must be clean, without unnecessary elements
- Information must be organized hierarchically (most important first)
- Texts must be clear and use appropriate but understandable medical language
- Icons must be universal and clear

### Security and Confidentiality
- The design must convey security and professionalism
- There must be clear indicators of active session
- Error messages must not reveal sensitive information
- There must be confirmations for important actions (delete, archive)

### Responsive and Accessibility
- It must work well on desktop, tablet, and mobile
- Buttons must be large enough to click easily (minimum 44x44px)
- Texts must have good contrast and be legible
- It must be usable with keyboard (tab navigation, Enter to submit)

### Consistency
- Colors must be consistent throughout the system
- Similar buttons must look and behave the same
- Navigation must be predictable
- Messages and confirmations must follow the same format

---

# Implementation Prioritization

## Phase 1 - Critical (High Priority)
- Story 1.1: First access to the system
- Story 1.2: Automatic access with assigned keys
- Story 2.1: Overview of consultation day
- Story 2.2: Quick access to most frequent actions
- Story 3.1: Quickly search patient by name
- Story 3.4: Access patient's complete record
- Story 4.1: Create clinical note during consultation (quick flow)
- Story 4.3: Capture essential consultation data
- Story 4.4: Save and validate clinical note
- Story 5.1: View all patient's previous notes
- Story 5.3: View highlighted relevant information
- Story 6.1: Register a new patient
- Story 7.1: Create appointment from patient profile
- Story 7.2: View calendar and daily schedule
- Story 8.1: View compliance metrics overview
- Story 8.2: View detailed compliance breakdown
- Story 8.3: View compliance alerts and notifications

## Phase 2 - Important (Medium Priority)
- Story 2.3: Critical information always visible
- Story 2.4: Clear navigation between sections
- Story 3.2: Search patient by record number or ID
- Story 3.3: View complete patient list
- Story 4.2: Use templates for common notes
- Story 4.5: View and edit recent notes
- Story 5.2: View patient's medical timeline
- Story 5.4: Search specific information in history
- Story 6.2: Edit patient information
- Story 6.3: View and organize patient list
- Story 6.5: View quick patient summary in list
- Story 7.3: Edit or cancel appointments
- Story 7.4: View appointment details and patient context
- Story 8.4: View compliance reports and history

## Phase 3 - Improvements (Low Priority)
- Story 1.3: Update profile photo (optional)
- Story 6.4: Archive or deactivate patients
- Story 8.5: Understand compliance requirements

---

# Notes for the UX Designer

This document is designed to be used by a UX designer who has no technical knowledge of the backend. All references are to visual elements, user flows, and interaction experience.

**Key points to consider:**

1. **The user is a busy doctor** - The design must prioritize speed and efficiency over decorative elements

2. **Legal compliance** - The system must comply with NOM-004 (Clinical Record) and NOM-024 (Health Information Systems). Certain fields are required and must be clearly marked. The compliance dashboard provides automated monitoring of these requirements.

3. **Usage context** - Doctors may use the system during real consultations, so it must be fast, non-intrusive, and allow attention to the patient

4. **Devices** - Consider that many doctors use tablets in consultation, the design must be touch-friendly

5. **Critical information** - Allergies, current medications, and important diagnoses must always be visible and highlighted

6. **Main flow** - The most common flow is: Search patient → View record → Create note → Save. This flow must be extremely fast and fluid

7. **Access model** - The system does not have traditional sign-in/login. Access is managed through keys assigned by the sales team. Users should have seamless access once their credentials are configured, without visible authentication steps.

8. **No onboarding required** - Doctors do not need to complete any onboarding process. Their professional profile (name, specialty, license number, etc.) is already validated and configured by the sales team before they access the system. The profile information is read-only for the doctor (except possibly the profile photo). The doctor should be able to start using the system immediately upon first access.

9. **Appointments module** - The system includes appointment scheduling functionality. Doctors can create appointments directly from patient profiles and view their calendar. The calendar should integrate seamlessly with patient records and clinical notes.

10. **Compliance dashboard** - The system includes an automated compliance dashboard that monitors adherence to NOM-004 and NOM-024. Metrics are calculated automatically, and doctors can view their compliance status, receive alerts for issues, and generate reports. This is critical for legal compliance and audit purposes.

---

*Document generated for UX design*
