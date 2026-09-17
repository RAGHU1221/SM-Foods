Create a complete, production-quality **Figma UI/UX design** for the existing **Sri Murugan Foods – POS Billing & ERP Management System** based on the uploaded project structure.

IMPORTANT:

* This is a **POS / ERP business software**, NOT a normal marketing website.
* Design it like a professional **Windows desktop business application / billing software**.
* It must also be fully responsive for Android mobile usage.
* Do NOT redesign the functionality or remove existing modules.
* Preserve the existing module names and workflow.
* Focus on a clean, fast, practical billing-software interface.

## APPLICATION

App Name:
**Sri Murugan Foods**

Application Type:
**POS Billing + ERP + Inventory Management System**

Primary users:

* Admin
* Billing Operator
* Store/Business User

Main usage:

* 95% Android/mobile POS usage
* Desktop Windows software usage
* Thermal printer billing
* A4 invoice printing
* Wholesale billing

---

# 1. GLOBAL DESIGN SYSTEM

Create a complete Figma Design System first.

Design style:

* Modern professional POS software
* Premium but practical
* Clean business application UI
* High readability
* Minimal unnecessary decoration
* Fast-access controls
* Rounded cards
* Subtle shadows
* Optional glassmorphism elements
* Professional red + dark premium theme
* Support Light Mode
* Support Dark Mode
* Support custom accent/color mode

Typography:

* English: Inter / Poppins
* Tamil: Noto Sans Tamil
* Strong readable numbers for prices and quantities

Buttons:

* Minimum touch target: 48 × 48 px
* Mobile buttons should be thumb-friendly
* Primary actions clearly visible
* Destructive actions require confirmation

Icons:
Use consistent modern outline icons.

---

# 2. APPLICATION SHELL

Design the application as a software dashboard, not a website.

Desktop layout:

LEFT:
Fixed sidebar navigation.

TOP:
Application header containing:

* Sri Murugan Foods logo
* Current page name
* Search
* Notifications
* Language switcher
* Theme switcher
* User profile
* Logout

MAIN:
Scrollable application workspace.

Desktop sidebar modules:

1. Dashboard
2. Billing
3. Wholesale Billing
4. Items
5. Wholesale Items
6. Item Types
7. Customers
8. Ledger
9. Outstanding
10. Receive Payment
11. Reports
12. Deleted Bills
13. Printer
14. Settings
15. Backup

Sidebar:

* Active state
* Icon + label
* Collapsible
* Tooltips when collapsed

---

# 3. MOBILE APPLICATION SHELL

Create a separate mobile-first layout.

Target widths:
320px
360px
375px
390px
412px
480px
768px

NO horizontal scrolling.

Mobile:

* Compact top header
* Hamburger menu
* Bottom navigation for important functions
* Floating billing/cart button where required
* Large touch targets
* Single-column forms
* Cards instead of desktop tables

Important:
Desktop tables MUST NOT simply shrink on mobile.

Convert data tables into mobile cards.

---

# 4. LOGIN SCREEN

Create professional POS login screen.

Include:

* Sri Murugan Foods logo
* Username
* Password
* Show/hide password
* Remember me
* Login button
* Forgot password
* Application version
* Offline status indicator

Desktop:
Centered software login panel.

Mobile:
Full-width compact login screen.

---

# 5. DASHBOARD

Create a professional ERP dashboard.

Top KPI cards:

* Today's Sales
* Today's Bills
* Cash Received
* UPI Received
* Outstanding
* Total Items

Charts:

* Daily Sales
* Monthly Sales
* Payment Method
* Top Selling Items

Quick actions:

* New Bill
* Wholesale Bill
* Add Item
* Customers
* Receive Payment
* Reports

Recent Bills:
Show:

* Bill No
* Customer
* Amount
* Payment
* Date
* Status
* Actions

Desktop:
Use table.

Mobile:
Use stacked bill cards.

---

# 6. POS BILLING SCREEN

THIS IS THE MOST IMPORTANT SCREEN.

Create a professional high-speed POS billing interface.

Desktop layout:

LEFT / MAIN:
Product search and item grid.

RIGHT:
Selected cart / bill panel.

Product area:

* Search item
* Barcode search
* Item category filter
* Item type filter
* Grid/List switch
* Product image
* Product name
* Selling price
* Stock
* * button

Each product card:
Image
Name
Price
Stock
Add button

Cart:

* Selected items
* Item name
* Quantity
* Minus button
* Quantity
* Plus button
* Rate
* Amount
* Remove button

Bill summary:
Subtotal
Discount
GST
Grand Total
Received
Balance

Payment methods:

* Cash
* UPI
* Card
* Credit

Customer:

* Select customer
* Add customer
* Walk-in customer

Primary actions:
SAVE BILL
SAVE & PRINT
SAVE & WHATSAPP
HOLD BILL
CLEAR

IMPORTANT:
On mobile, selected cart must ALWAYS remain accessible.

Use:

* Sticky cart panel OR
* Floating Cart button with item count and total

Checkout button must remain visible.

---

# 7. BILL PREVIEW

Create invoice preview screen.

Show:
Sri Murugan Foods logo
Business details
Bill number
Date/time
Customer details

Items:
Item
Qty
Rate
Amount

Summary:
Subtotal
Discount
GST
Total
Received
Balance

Payment method.

Actions:

* Print Thermal
* Print A4
* Download PDF
* WhatsApp
* Share
* Close

Create both:

* English invoice
* Tamil invoice

Language selection must affect the invoice text.

---

# 8. WHOLESALE BILLING

Create separate wholesale billing interface.

Features:

* Product search
* Wholesale item selection
* Quantity controls
* Editable amount/rate
* Customer selection
* Discount
* GST / Non-GST
* Total
* Received
* Balance

IMPORTANT:
Wholesale item amount/rate must be directly editable.

Actions:

* Save
* Save & Print
* WhatsApp
* Hold
* Clear

Mobile must use a card-based item editor.

---

# 9. ITEMS MANAGEMENT

Create Items management screen.

Desktop:
Professional data table.

Columns:

* Image
* Item Name
* Item Type
* Purchase Price
* Selling Price
* Wholesale Price
* Stock
* GST
* Status
* Actions

Actions:

* Add
* Edit
* Delete
* View
* Search
* Filter
* Import
* Export

Mobile:
Convert every item into a card.

Item card:
Image
Name
Type
Price
Stock
Status
Edit
Delete

---

# 10. ADD / EDIT ITEM

Create a professional form.

Fields:

* Item Name
* Tamil Item Name
* Item Type
* SKU / Code
* Barcode
* Purchase Price
* Selling Price
* Wholesale Price
* GST
* Opening Stock
* Minimum Stock
* Unit
* Item Image
* Active/Inactive

Mobile:
Single-column layout.

Desktop:
Two-column form.

---

# 11. ITEM TYPES

Create CRUD screen for:

* Masala Items
* Nuts Items
* Other item categories

Actions:
Add
Edit
Delete
Enable/Disable

Use compact category cards.

---

# 12. CUSTOMERS

Customer management.

Fields:

* Customer Name
* Mobile
* Address
* GST Number
* Opening Balance
* Credit Limit

Screens:

* Customer list
* Add customer
* Edit customer
* Customer profile
* Customer ledger

Mobile:
Customer cards.

---

# 13. LEDGER

Create professional customer ledger.

Show:
Date
Bill No
Description
Debit
Credit
Balance

Filters:

* Customer
* Date range
* Payment type

Actions:

* Print
* PDF
* Export
* WhatsApp

Mobile:
Timeline/card ledger.

---

# 14. OUTSTANDING

Create outstanding management.

Dashboard:

* Total Outstanding
* Customers with Balance
* Today's Collection
* Overdue Amount

Customer cards:
Customer
Mobile
Outstanding
Last Payment
Receive Payment button

Use clear visual hierarchy.

---

# 15. RECEIVE PAYMENT

Create payment collection screen.

Fields:

* Customer
* Outstanding Amount
* Received Amount
* Payment Method
* Reference Number
* Notes

After payment:
Show:
Previous Balance
Received
Remaining Balance

Actions:
Save
Print Receipt
WhatsApp Receipt

---

# 16. REPORTS

Create complete Reports dashboard.

Reports:

* Daily Sales
* Monthly Sales
* Item Sales
* Customer Sales
* GST Report
* Payment Report
* Outstanding Report
* Profit Report
* Wholesale Report

Filters:

* From Date
* To Date
* Item
* Customer
* Payment Method

Actions:

* View
* PDF
* Excel
* Print
* WhatsApp

Charts and KPI cards should be included.

Mobile reports should use cards and horizontally scrollable chart containers only where necessary.

---

# 17. DELETED BILLS

Create Deleted Bills screen.

Show:
Bill No
Date
Customer
Amount
Deleted By
Deleted Date
Reason
Restore

Require confirmation before restore/delete actions.

---

# 18. PRINTER SETTINGS

Create printer management interface.

Settings:

* Thermal Printer
* A4 Printer
* Printer Name
* Paper Width
* Copies
* Auto Print
* Test Print

Actions:
Save Settings
Test Print

Show printer connection status.

---

# 19. SETTINGS

Create complete Settings interface.

Sections:

Business Settings

* Business Name
* Address
* Phone
* GST Number
* Logo
* Invoice Footer

Billing Settings

* GST / Non-GST
* Default Payment
* Invoice Prefix
* Invoice Number
* Decimal Settings

Language:

* English
* Tamil

Theme:

* Light
* Dark
* Custom Accent

Printer:
Thermal
A4

Security:
Password
User settings
Session

Backup:
Database backup
Restore
Export

---

# 20. BACKUP

Create backup management page.

Show:
Last Backup
Database Size
Backup Status

Actions:

* Create Backup
* Download Backup
* Restore Backup

Use confirmation dialogs for restore.

---

# 21. HOLD BILL

Create Hold Bills interface.

Cards:
Bill Number
Customer
Items
Total
Created Time

Actions:
Resume
Delete
View

Mobile-friendly.

---

# 22. SEARCH

Global search interface.

Search:

* Items
* Bills
* Customers
* Wholesale Bills

Show recent searches and categorized results.

---

# 23. NOTIFICATIONS

Create notification panel.

Examples:

* Low stock
* Payment received
* Backup completed
* Printer disconnected
* New bill

Unread/read states.

---

# 24. LANGUAGE SYSTEM

The UI must support:

English
Tamil

Create both versions in Figma.

Tamil text must be grammatically correct.

Do not use incorrect Tamil translations.

Language switching should update:

* Menu
* Buttons
* Forms
* Billing
* Invoice
* Reports
* Settings

---

# 25. GST / NON-GST

Billing UI must clearly support:

GST Bill
Non-GST Bill

When GST is enabled:
Show GST fields and tax calculations.

When GST is disabled:
Hide unnecessary GST fields.

Do not overcrowd the billing interface.

---

# 26. PAYMENT UX

Create payment modal.

Options:
Cash
UPI
Card
Credit

For UPI:
Show:
Total
Received
Balance

If received amount is lower than total:
Clearly show remaining balance.

If received amount is higher:
Clearly show change/balance.

Use confirmation before final checkout.

---

# 27. CONFIRMATION DIALOGS

Create reusable modal components.

Examples:
Delete Item
Delete Bill
Clear Cart
Duplicate Item
Restore Bill
Logout
Restore Backup

Example:
"Are you sure you want to delete this item?"

Buttons:
Cancel
Confirm

---

# 28. RESPONSIVE DESIGN RULES

MANDATORY:

320px:

* 1 product column
* Single-column forms
* Compact header
* No horizontal page scrolling

360–390px:

* 1–2 product columns depending on available width
* Sticky cart / floating cart

412–480px:

* 2 product columns
* Comfortable touch controls

768px:

* Tablet layout

Desktop:

* Sidebar
* Multi-column POS
* Data tables

Do NOT simply scale desktop UI down.

---

# 29. COMPONENT LIBRARY

Create reusable Figma components:

Buttons
Inputs
Selects
Search bars
Cards
KPI cards
Product cards
Cart items
Bill cards
Customer cards
Tables
Mobile cards
Badges
Tabs
Dropdowns
Modals
Toast notifications
Pagination
Charts
Sidebar
Header
Bottom navigation
Payment modal
Print modal
Confirmation modal

Create variants:
Default
Hover
Pressed
Disabled
Loading
Success
Warning
Error

---

# 30. PROTOTYPE FLOW

Create clickable Figma prototype.

Main flow:

Login
→ Dashboard
→ Billing
→ Search Item
→ Add Item
→ Cart
→ Checkout
→ Payment
→ Bill Preview
→ Print / WhatsApp

Second flow:

Dashboard
→ Items
→ Add Item
→ Save
→ Item List

Third flow:

Dashboard
→ Customers
→ Customer
→ Ledger
→ Receive Payment
→ Receipt

Fourth flow:

Dashboard
→ Reports
→ Filter
→ Report
→ PDF / Excel / Print

---

# 31. MOBILE BILLING FLOW

Create a complete mobile prototype.

Mobile:

Open Billing
→ Search
→ Select Item
→ Product added
→ Floating Cart
→ Open Cart
→ Change Quantity
→ Payment
→ Checkout
→ Bill Preview
→ Print / Share

The checkout action must never disappear below the screen.

---

# 32. VISUAL QUALITY

The final Figma design must look like a real commercial POS/ERP product.

Avoid:

* Marketing website hero sections
* Huge banners
* Excessive gradients
* Decorative animations
* Unnecessary whitespace
* Tiny buttons
* Tiny text
* Desktop tables squeezed into mobile
* Complex navigation

Prioritize:

* Speed
* Readability
* Billing efficiency
* Touch accessibility
* Clear totals
* Clear actions
* Professional business appearance

---

# 33. REQUIRED FIGMA PAGES

Create these Figma pages:

01 – Design System
02 – Login
03 – Dashboard
04 – POS Billing
05 – Wholesale Billing
06 – Bill Preview
07 – Items
08 – Add/Edit Item
09 – Item Types
10 – Customers
11 – Customer Ledger
12 – Outstanding
13 – Receive Payment
14 – Reports
15 – Deleted Bills
16 – Hold Bills
17 – Printer
18 – Settings
19 – Backup
20 – Mobile Screens
21 – Components
22 – Prototype Flows

---

# FINAL REQUIREMENT

Build the entire interface as a **real desktop POS software UI with a strong mobile-first billing experience**.

Do not create a generic website.

The result should feel like a professional commercial billing application that can later be implemented using the existing PHP + MySQL backend.

Preserve the existing Sri Murugan Foods functionality and module structure while significantly improving:

* UI clarity
* usability
* responsiveness
* billing speed
* visual consistency
* mobile usability
* print workflow
* Tamil/English language experience.

Create all important screens, states, empty states, loading states, error states, confirmation dialogs and responsive variants in Figma.
