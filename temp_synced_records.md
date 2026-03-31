# Temp Synced Records — Snapshot (2026-03-31)

Last sync: `2026-03-31T11:36:38Z` | Total records: **45** (15 Bugs · 15 Projects · 15 Users)

---

## Verification of Airtable Changes

### ✅ User name → "Ayush"
Record `recPksOICzMFVbp0H` in **Users** table:
```json
{
  "Name": "Ayush",
  "Role": "Developer",
  "Team": "Frontend",
  "Email": "alice.johnson@example.com"
}
```
Change is reflected correctly in Supabase.

### ⚠️ Project team → "Security Team 1"
Record `recEwGQyepvzYbkTu` in **Projects** table (Bug Bounty Program):
```json
{
  "Project Name": "Bug Bounty Program",
  "Team": "Security Team1",
  "Status": "Planning"
}
```
> **Note:** Stored as `"Security Team1"` (no space before `1`). If you typed "Security Team 1" (with a space) in Airtable, the sync captured it exactly as-is from Airtable — double-check the Airtable cell value.

---

## All Users
| Record ID          | Name           | Role             | Team     |
|--------------------|----------------|------------------|----------|
| recPksOICzMFVbp0H  | **Ayush**      | Developer        | Frontend |
| recWMW3bJwvimueHX  | Frank Miller   | Developer        | Frontend |
| rec9qcU79Mf2emWMv  | Kevin Brown    | Developer        | Frontend |
| recPmdwnTyKp9S28A  | Hannah Smith   | Developer        | Backend  |
| recPXkuXB6gEiytX6  | Nina Patel     | Developer        | Backend  |
| recHFEKlhaMlEnoKb  | David Kim      | Developer        | Backend  |
| recjvLsk1djr2ho9b  | Linda Nguyen   | Designer         | Design   |
| recz98VejwpwUSndC  | Grace Park     | Designer         | Design   |
| recl2hcAOzqeFQbzq  | Carmen Diaz    | Product Manager  | Product  |
| recAPhW40kAOiCAS9  | Oscar Rivera   | Product Manager  | Product  |
| recYxqqqAczvUsSFe  | Julia Roberts  | Product Manager  | Product  |
| recW2qlq655cM2370  | Emily Chen     | QA Engineer      | QA       |
| rec3AN6UySXk79ZHB  | Michael Scott  | QA Engineer      | QA       |
| recmRBWbrUQGbiWnH  | Ivan Petrov    | QA Engineer      | QA       |
| recs0l7jl1h67jy8Q  | Brian Lee      | QA Engineer      | QA       |

## All Projects
| Record ID          | Project Name          | Team              | Status      |
|--------------------|-----------------------|-------------------|-------------|
| recUQLwY1OmN3eriX  | Security Audit        | Security Team     | In Progress |
| recIjielS4d609hXd  | Cloud Migration       | Cloud Ops         | In Progress |
| recpaMWVvZbUxXrum  | Mobile App Launch     | Mobile Devs       | Completed   |
| recqJlZLVfofvOX0m  | Website Redesign      | Web Team          | In Progress |
| recv5piekOBUfI4Qm  | E-commerce Platform   | E-commerce Team   | Planning    |
| recyRd6gLANn7J8hH  | Data Warehouse        | Data Team         | In Progress |
| recBeNEtKDfaDK0DY  | API Development       | API Team          | Completed   |
| recBlfe8FBC3suhah  | Performance Dashboard | Analytics Team    | In Progress |
| recEwGQyepvzYbkTu  | Bug Bounty Program    | **Security Team1**| Planning    |
| recJ1BaCrcl6t418q  | Inventory Management  | Logistics Team    | In Progress |
| recKjWx7OOS5AF31w  | Customer Portal       | Portal Devs       | In Progress |
| recKxZ3k0s27y8LNz  | HR Onboarding System  | HR Tech           | Completed   |
| recNdYpxCdIxpMwns  | CRM Integration       | Integration Team  | On Hold     |
| recZiBX9K8HBAWHzP  | Marketing Automation  | Marketing Tech    | Completed   |
| recZshe6S4aQeW2vR  | Internal Chat Tool    | Comms Team        | On Hold     |
