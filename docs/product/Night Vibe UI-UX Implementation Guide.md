# **Night Vibe UI-UX Implementation Guide**

## **1\. Purpose**

This document defines the UI-UX rules, visual language, interaction patterns, and page-level implementation expectations for the Night Vibe mobile app.

It is written for:

* Frontend developers  
* Full-stack developers implementing screens and flows  
* Designers refining the visual system  
* AI coding agents generating or editing UI code  
* QA engineers validating UI consistency

This guide is intended to help the team reproduce the same UI-UX direction shown in the HTML mockups across all app pages in a consistent, scalable, and implementation-friendly way.

---

## **2\. Product UI Vision**

Night Vibe is a mobile-first nightlife social app. The UI should feel:

* Modern  
* Premium  
* Night-oriented  
* Energetic but not chaotic  
* Romantic / social rather than aggressive  
* Clean enough for repeated daily use  
* Focused on real-world venue presence and live interaction

The visual identity should communicate:

* Nightlife atmosphere  
* Trust and safety  
* Real-time activity  
* Human connection  
* Simplicity in navigation

The app should not feel like a loud gaming interface, nor like a corporate dashboard. It should feel like a polished consumer mobile product for adults going out at night.

---

## **3\. Core UX Principles**

### **3.1 Mobile-first at all times**

All screens must be designed for mobile first. The main target is portrait phone usage.

### **3.2 Fast comprehension**

Users should understand what a page is for within 2 to 3 seconds.

### **3.3 One primary action per screen**

Every screen should clearly emphasize its main action, such as:

* Sign in  
* Continue onboarding  
* Check in  
* Like  
* Send message  
* Submit venue  
* Approve venue

### **3.4 Progressive disclosure**

Do not overload the user with too many controls at once. Show the most relevant information first, and secondary controls after that.

### **3.5 Real-time clarity**

Because this app depends on live venue presence, the interface must clearly communicate current state:

* Checked in or not checked in  
* Chat enabled or locked  
* Venue live status  
* Approval pending  
* Active subscription or expired

### **3.6 Trust and safety visibility**

Safety-related actions must be easy to find but should not dominate the main experience.

### **3.7 Consistency over novelty**

A small number of reusable patterns is better than many unique page layouts.

---

## **4\. Visual Design Language**

### **4.1 Theme direction**

Use a dark, layered, nightlife-inspired interface.

Base visual characteristics:

* Deep navy / near-black backgrounds  
* Soft glass-like cards  
* Purple-to-pink accent gradients  
* White primary text  
* Muted blue-gray secondary text  
* Soft border lines with low opacity  
* Rounded corners across the product  
* Subtle shadows and depth

### **4.2 Emotional tone**

The interface should feel:

* Confident  
* Attractive  
* Calm  
* Slightly luxurious  
* Friendly

Avoid:

* Harsh neon overload  
* Too many saturated colors at once  
* Dense enterprise-style tables in user-facing screens  
* Flat and boring grayscale layouts

---

## **5\. Design Tokens**

These tokens should be implemented in a shared design system or theme file.

### **5.1 Colors**

#### **Backgrounds**

* Primary background: deep navy / black  
* Secondary background: slightly lighter panel tone  
* Card background: translucent white on dark background  
* Modal background: dark elevated surface

#### **Text**

* Primary text: near-white  
* Secondary text: muted cool gray / blue-gray  
* Tertiary text: softer muted value for metadata

#### **Accent colors**

* Primary accent: violet / purple  
* Secondary accent: pink / magenta  
* Accent gradient: purple to pink

#### **Semantic colors**

* Success: green-teal  
* Warning: amber/orange  
* Danger: red  
* Info/live: cyan-blue if needed sparingly

### **5.2 Radius**

Use rounded corners consistently.  
Suggested scale:

* Small: 12  
* Medium: 16  
* Large: 20  
* XL: 22 to 26  
* Device-shell mockup radius is visual-only; app components should typically use 16 to 24

### **5.3 Borders**

Use subtle borders rather than strong outlines.

* Border opacity should remain soft  
* Borders should define surfaces without making the UI look boxed-in

### **5.4 Shadows**

Use soft shadows only to create layered elevation. Do not use heavy black shadows on every component.

### **5.5 Spacing**

Use a consistent spacing scale. Suggested base scale:

* 4  
* 8  
* 12  
* 16  
* 20  
* 24  
* 32

Most page content should be built around 16px internal spacing with 12px to 16px gaps between related items.

### **5.6 Typography**

Suggested hierarchy:

* Display / marketing headline: very bold, large, tight tracking  
* Page title: bold, medium-large  
* Card title: semibold to bold  
* Body text: regular  
* Metadata: small, muted  
* Label text: small, readable, not too faint

Typography style rules:

* Prefer clean sans-serif  
* Use bold headlines with slightly tighter letter spacing  
* Keep body copy short  
* Avoid long paragraphs in the app UI

---

## **6\. Layout Rules**

### **6.1 Screen structure**

Most screens should follow this structure:

1. Top bar  
2. Intro / context block  
3. Main content cards or lists  
4. Primary action area  
5. Bottom navigation where applicable

### **6.2 Content width**

The app is mobile-first and should visually fit narrow widths. Content should not feel edge-to-edge unless used intentionally for image banners or full-width panels.

### **6.3 Safe area handling**

All screens must respect:

* Top safe area  
* Bottom safe area  
* Floating bottom navigation or action bars

### **6.4 Scroll behavior**

Most pages should scroll vertically. Avoid nested scroll areas unless absolutely necessary.

### **6.5 Sticky elements**

Allowed sticky patterns:

* Bottom navigation  
* Persistent bottom CTA  
* Sticky chat input  
* Sticky segmented control if useful on long lists

Do not overuse sticky UI.

---

## **7\. Reusable UI Components**

The app should be implemented from reusable components rather than custom one-off layouts.

### **7.1 Top bar**

Common top bar variants:

* Brand \+ utility icon  
* Back button \+ page title \+ status pill  
* Title \+ settings icon

Rules:

* Height must be consistent  
* Icons must be aligned and tappable  
* Titles should not wrap unless necessary

### **7.2 Buttons**

Button variants:

* Primary: gradient purple-pink  
* Secondary / ghost: dark transparent button with border  
* Success: positive action  
* Warning / danger: destructive or high-risk action  
* Small button: inline card action

Rules:

* One primary button per main action area  
* Minimum comfortable touch target  
* Button labels must be action-oriented

Examples:

* Continue  
* Check in  
* Send  
* Approve  
* Renew plan  
* Ban permanently

### **7.3 Pills / chips**

Use pills for:

* Status  
* Filters  
* Preferences  
* Tags  
* Live states  
* Risk indicators

Pills should remain compact and readable.

### **7.4 Cards**

Cards are a core container pattern across the app.

Use cards for:

* Profile summaries  
* Analytics blocks  
* Forms  
* Venue previews  
* Report details  
* Plan options

Card rules:

* Rounded corners  
* Soft border  
* Slightly elevated or translucent surface  
* Internal spacing of 12 to 16

### **7.5 List items**

Common list row structure:

* Leading avatar/image/icon  
* Main title  
* Secondary metadata  
* Optional trailing pill or action

### **7.6 Stats blocks**

Stats should be compact and highly scannable.  
Use a number-first hierarchy.

### **7.7 Bottom navigation**

Main user navigation tabs:

* Venues  
* Matches  
* Chats  
* Add Venue  
* Profile

Rules:

* Fixed to bottom for user-facing screens  
* Clear active tab state  
* Icon \+ label structure  
* Do not overload with more than 5 items

### **7.8 Segmented controls / tab bars**

Use for toggling between closely related views such as:

* Potential Matches / Matches  
* Active / Pending  
* Overview / Analytics

### **7.9 Inputs**

Input style should match the dark glass surface language.

Required states:

* Default  
* Focused  
* Error  
* Disabled  
* Filled

### **7.10 Empty state blocks**

Use dashed or muted boxes where content is not yet available.  
Examples:

* No photos yet  
* No venues found nearby  
* No active chats  
* Waiting for venue approval

---

## **8\. Motion and Interaction Guidance**

### **8.1 Motion style**

Motion should be subtle, smooth, and premium.

Recommended motion style:

* Fade \+ slight slide  
* Soft scale on entry for cards or modals  
* Quick button feedback  
* Smooth state transitions

Avoid:

* Bouncy arcade-style motion  
* Overly dramatic transitions  
* Too many competing animations on one screen

### **8.2 Feedback timing**

Important actions should provide immediate feedback:

* Check-in success  
* Match created  
* Message sent  
* Venue submitted  
* Moderation action completed

### **8.3 State transitions**

Users must always understand what changed after an action.

Examples:

* Check in button becomes checked-in state  
* Chat row changes from locked to live  
* Pending venue changes to approved  
* Reported user action changes status immediately

---

## **9\. Page-by-Page UI-UX Specification**

## **9.1 Welcome and Sign-In Screen**

### **Goal**

Introduce the value proposition and lead the user to authentication.

### **Required content**

* Brand mark or brand text  
* Headline explaining the core value  
* Short supporting description  
* Main sign-in button  
* Secondary sign-in option if required by platform policy  
* Legal acceptance note  
* Optional feature pills

### **UX rules**

* Primary CTA must be visible without scrolling  
* Marketing copy must be short  
* Do not show technical details here  
* This page should feel aspirational and trustworthy

### **Visual rules**

* Strong hero emphasis  
* Gradient accent area or hero card  
* Minimal clutter

---

## **9.2 Onboarding / Profile Setup**

### **Goal**

Collect the minimum profile data needed to enter the experience.

### **Required content**

* Progress indicator  
* Basic identity fields  
* Date of birth  
* Gender  
* Bio  
* Photo upload area  
* Preference fields  
* Continue CTA

### **UX rules**

* Split long onboarding into steps  
* Show only what is necessary per step  
* Explain why photos are needed  
* Use validation inline, not only after submit  
* Always preserve data when user goes back

### **Visual rules**

* Use stacked cards for form sections  
* Keep form labels short and clear  
* Photo upload area must be visually inviting

---

## **9.3 Venues List Screen**

### **Goal**

Help users discover nearby venues where they can check in.

### **Required content**

* Top bar with search or filter access  
* Nearby venue filters  
* Venue cards list  
* Distance  
* Live check-in count  
* Crowd indicators  
* Check-in or view action  
* Bottom navigation

### **UX rules**

* Sort nearest first by default  
* Make it easy to scan venue cards quickly  
* Highlight live relevance, not only venue name  
* Show enough crowd information to support decision-making  
* If maps are not used, list-based discovery must be very strong

### **Visual rules**

* Venue cards should include a strong visual banner  
* Distance badge must be visible but not dominant  
* Check-in CTA must stand out

---

## **9.4 Venue Detail / Live Venue Screen**

### **Goal**

Show the current venue context and unlock live social actions.

### **Required content**

* Venue header image  
* Venue title and type  
* Check-in status  
* Live stats  
* Match tabs  
* Potential match rows  
* Checkout action

### **UX rules**

* Current state must be extremely clear  
* Users must immediately understand that this is a live venue context  
* Checkout must be accessible, but not visually stronger than the live experience  
* If user loses eligibility, communicate it clearly

### **Visual rules**

* Live stats should be compact and bold  
* Match list should feel social, not spreadsheet-like

---

## **9.5 Match Profile Screen**

### **Goal**

Allow the user to evaluate a potential match.

### **Required content**

* Large profile photo area  
* Name and age  
* Venue-related status  
* Bio  
* Interest tags  
* Photo grid  
* Like / Skip controls  
* Optional unmatch / report access

### **UX rules**

* Photo and identity must dominate the page  
* User intent actions must be very obvious  
* Secondary destructive actions must be less prominent

### **Visual rules**

* Strong visual hierarchy from image to identity to bio to actions

---

## **9.6 Chats Screen**

### **Goal**

Enable venue-based chat only when conditions are met.

### **Required content**

* Chats list  
* Active vs locked state visibility  
* Chat thread area  
* Message bubbles  
* Input row  
* Send CTA

### **UX rules**

* Locked chat states must be understandable instantly  
* Active venue chat should feel immediate and personal  
* Message composer must remain easy to use one-handed  
* Show state if the chat is no longer available due to venue mismatch

### **Visual rules**

* Sent and received messages must be visually distinct  
* Active chat card should stand out slightly from the list

---

## **9.7 User Profile Screen**

### **Goal**

Allow users to view and manage their own profile.

### **Required content**

* Hero photo area  
* Name, age, summary  
* Bio  
* Preferences  
* Edit profile  
* Settings access  
* Blocked users  
* Logout  
* Delete account option

### **UX rules**

* Make edit access obvious  
* Keep account-destruction actions separated from regular actions

---

## **9.8 Add Venue Screen**

### **Goal**

Allow a regular user or owner to submit a new venue.

### **Required content**

* Multi-step progress state  
* Venue name  
* Address  
* Category  
* Description  
* Image upload  
* Continue CTA

### **UX rules**

* Form should feel business-like but still aligned with app branding  
* Make approval expectations explicit  
* Save progress during submission flow

---

## **9.9 Plan Selection / Checkout Screen**

### **Goal**

Help venue submitters choose a plan and continue to payment.

### **Required content**

* Plan cards  
* Price  
* Feature summary  
* Trial highlighting  
* Selection state  
* Summary card  
* Continue to payment CTA

### **UX rules**

* Users should be able to compare plans in seconds  
* Most recommended plan may be highlighted  
* Do not bury important billing conditions

### **Visual rules**

* Featured plan may use stronger gradient treatment  
* Summary block should feel trustworthy and transactional

---

## **9.10 Venue Owner Dashboard**

### **Goal**

Provide venue operators with simple operational insights.

### **Required content**

* Current stats  
* Subscription status  
* Live or weekly analytics  
* Venue list  
* Manage venue action  
* Renew plan action

### **UX rules**

* Keep it simple and actionable  
* Owners should see operational value immediately  
* Do not overwhelm with advanced analytics on the first screen

### **Visual rules**

* More dashboard-like than consumer screens, but still part of the same design system

---

## **9.11 Admin / Moderator Dashboard**

### **Goal**

Provide a high-level platform overview for admin users.

### **Required content**

* Summary metrics  
* Growth or trend chart  
* Pending venue approvals  
* Quick moderation actions

### **UX rules**

* Prioritize important queues and risk areas  
* Admin should reach critical actions quickly

### **Visual rules**

* Cleaner and more operational than the user-facing app  
* Still reuse cards, stats, pills, and buttons from the same system

---

## **9.12 Reports and User Moderation Screen**

### **Goal**

Help moderators review and act on safety cases.

### **Required content**

* Reported users list  
* Risk labels  
* Report details  
* Categories/tags  
* Warn / suspend / ban actions

### **UX rules**

* Risk level should be scannable  
* Destructive actions must be visually clear and intentionally separated  
* History and evidence access should be supported in the real implementation

---

## **9.13 Settings Screen**

### **Goal**

Allow user, admin, or owner configuration access.

### **Required content**

* Preference settings  
* Platform thresholds or admin settings where role permits  
* Manage categories/plans  
* Delete account access

### **UX rules**

* Group settings into logical sections  
* Separate user preferences from admin controls  
* Dangerous actions belong at the bottom

---

## **10\. Role-Based UI Behavior**

Different user roles must see different navigation and page entry points.

### **10.1 Regular user**

Main focus:

* Discover venues  
* Check in  
* Match  
* Chat  
* Manage own profile

### **10.2 Venue owner**

Main focus:

* Submit venue  
* Manage listing  
* Monitor activity  
* Renew plan

### **10.3 Admin / moderator**

Main focus:

* View platform metrics  
* Approve venues  
* Moderate users  
* Manage thresholds and categories

UI must not expose irrelevant controls to the wrong role.

---

## **11\. Accessibility Rules**

Even with a dark premium aesthetic, the app must remain accessible.

### **11.1 Contrast**

* Text must remain readable on dark surfaces  
* Muted text must still pass practical readability for mobile use

### **11.2 Touch targets**

* Buttons, tabs, pills used as actions, and icons must have comfortable tap size

### **11.3 Text size**

* Metadata can be small, but not too small  
* Important actions must never rely on tiny text

### **11.4 State indication**

Do not communicate meaning by color only.  
Also use:

* Labels  
* Icons  
* Position  
* Status text

### **11.5 Screen reader support**

Implementation should support accessible labels for:

* Buttons  
* Inputs  
* Navigation items  
* Status indicators  
* Avatars and images where meaningful

---

## **12\. Responsive and Technical Implementation Guidance**

### **12.1 Mobile implementation baseline**

The visual system should translate well into:

* React Native  
* Expo  
* Tailwind-style utility systems if used  
* Shared theme token structure

### **12.2 Componentization requirement**

Developers and AI agents should implement reusable components for:

* AppHeader  
* PrimaryButton  
* SecondaryButton  
* StatusPill  
* GlassCard  
* VenueCard  
* UserRow  
* StatCard  
* SegmentedControl  
* BottomTabBar  
* MessageBubble  
* FormField  
* EmptyStateBlock

### **12.3 Avoid hardcoded one-off styling**

AI agents should not generate fully unique styling per screen.  
Instead, they should reuse shared tokens and base components.

### **12.4 Consistency requirement for AI-generated code**

Any AI-generated UI code must follow these rules:

* Reuse theme tokens  
* Reuse spacing scale  
* Reuse shared component variants  
* Keep rounded visual language  
* Preserve dark gradient nightlife identity  
* Keep only one visual system across all pages

---

## **13\. QA Checklist for UI-UX Consistency**

QA should validate the following on every implemented page:

### **13.1 Visual consistency**

* Colors match theme  
* Corner radii are consistent  
* Card styles are consistent  
* Buttons use approved variants  
* Typography hierarchy is respected

### **13.2 Layout consistency**

* Page padding is consistent  
* Vertical rhythm is consistent  
* Top bars align properly  
* Bottom navigation behaves consistently

### **13.3 Interaction consistency**

* Primary action is obvious  
* Disabled and locked states are understandable  
* Destructive actions are styled appropriately  
* Loading, success, and error states are clear

### **13.4 Functional clarity**

* Checked-in state is obvious  
* Live chat availability is obvious  
* Approval pending states are obvious  
* Role-based controls are correct

---

## **14\. Implementation Rules for AI Agents**

When an AI agent generates or edits UI code for Night Vibe, it must obey the following:

### **14.1 Always preserve the global design system**

Do not invent a different visual language for a new screen.

### **14.2 Prefer composition over duplication**

Build pages from shared components.

### **14.3 Keep screens readable and action-oriented**

Do not overcrowd screens with too many buttons, chips, or metrics.

### **14.4 Respect role-based UI boundaries**

Do not mix admin controls into regular user screens.

### **14.5 Preserve nightlife identity without reducing usability**

The app must stay stylish, but clarity comes before decoration.

### **14.6 Maintain implementation realism**

Generated UI must be practical for React Native / Expo implementation and should not depend on web-only tricks that are hard to reproduce on mobile.

---

## **15\. Recommended Shared Component Inventory**

Minimum shared UI kit recommended for implementation:

* ScreenContainer  
* SafeAreaLayout  
* GradientBackground  
* HeaderBar  
* IconCircleButton  
* PrimaryCTAButton  
* SecondaryCTAButton  
* DangerButton  
* GlassCard  
* GradientCard  
* InputField  
* TextAreaField  
* SelectField  
* FilterChip  
* StatusPill  
* VenueHeroImage  
* Avatar  
* UserListItem  
* VenueListCard  
* StatMetricCard  
* EmptyStateCard  
* BottomNavigation  
* ChatBubbleIncoming  
* ChatBubbleOutgoing  
* SegmentedTabs  
* ProgressStepHeader  
* PlanOptionCard  
* ModerationActionBar

---

## **16\. Final Design Intent Summary**

If the team follows this guide correctly, Night Vibe should feel like:

* A premium dark mobile social app  
* Built for nightlife and real-time venue presence  
* Consistent across user, owner, and admin flows  
* Attractive enough for consumers  
* Structured enough for business and moderation workflows  
* Easy for developers and AI agents to implement repeatedly without visual drift

The final product should be visually memorable, but more importantly, it should make real-time nightlife interactions feel simple, safe, and immediate.

