CS 308: Online Store Project
----------
    Course Project for CS 308: Software Engineering

Project Overview
-------
This project is a full-stack e-commerce web application designed to simulate a real-world online shopping experience. It features a robust inventory system, role-based access control (Customer, Sales Manager, Product Manager), secure payment mock-ups, and a complete order/return lifecycle.

The system is built with a focus on concurrency, defensive programming, and security awareness, ensuring that sensitive data like user credentials and invoices are protected.

Key Features
---------------------------------------------------------------------------------------
Customer Experience

    Browsing & Search: Search products by name/description and sort by price or popularity.

    Shopping Cart: Add products to the cart as a guest; login required only for checkout.

    Wishlist: Save favorite items and get notified automatically when a Sales Manager applies a discount.

    Reviews: Comment and rate products (1-5 stars/1-10 points).

    Order Tracking: Monitor status (Processing, In-transit, Delivered) and download PDF invoices.

    Returns & Refunds: Request a refund within 30 days. Automated calculation ensures the refunded amount matches the discounted price at the time of purchase.


Sales Manager 

    Dynamic Pricing: Set prices and apply discount rates to selected products.

    Financial Analysis: Calculate revenue/profit/loss for specific date ranges with visual charts.

    Invoice Management: View, print, and export all system invoices as PDF.

Product Manager 

    Inventory Control: Add/remove products and categories, and manage live stock levels.

    Delivery Department: Oversee the delivery list (Delivery ID, Customer, Address, Status).

    Moderation: Approve or disapprove customer comments before they become public.

----------------------------------------------------------------------------------------------------------------------------------
Tech Stack

    Frontend: [ ]

    Backend: [ ]

    Database: [ ]

    State Management: [ ]

    File Generation: [ ] for PDF invoices.

------------------------------------------------------------------------------------------------------------------------------------
Security & Defensive Programming

    Data Encryption: All sensitive information (passwords, credit card info, invoices) is stored in an encrypted format.

    RBAC (Role-Based Access Control): Strict privilege separation between user roles.

    Concurrency Handling: Implemented to prevent race conditions during simultaneous stock updates.

    Input Validation: Sanitize all user inputs.

-------------------------------------------------------------------------------------------------------------------------------------
Team Members

    [Member Name] - [Backend Developer]

    [Member Name] - [Frontend Developer]

    [Member Name] - [Full Stack]

    [Member Name] - [Project Managers]

-----------------------------
Project Roadmap & Sprint Schedule
----------------
Sprint 1: Project Initiation & Team Alignment (COMPLETED)
------
[x] Task 1: Formation of the project team and role assignments.

[x] Task 2: Initial brainstorming sessions for the E-commerce theme.

[x] Task 3: Analysis of project requirements.

[x] Task 4: Review of the grading rubric and technical constraints.

[x] Task 5: Setting up the communication channels

    "Sprint 1 was dedicated to organizational meetings, requirement gathering, and team coordination. No coding was performed during this period."

Sprint 2: Setup & Design (Current)
--------
[ ] Task 1: Finalize Tech Stack (Frontend, Backend, Database).

[ ] Task 2: Initialize Git repository.

[ ] Task 3: Design Database ER Diagram (Users, Products, Categories, Orders).

[ ] Task 4: Create "User Personas" and define Role-Based Access (Customer, Sales Manager, Product Manager).

[ ] Task 5: Setup CI/CD pipeline


Sprint 3: Core Features (Preparation for Progress Demo)
------------
[ ] Task 6: Develop User Sign-up & Login with encrypted passwords.

[ ] Task 7: Implement Product Listing page with categories.

[ ] Task 8: Build Search bar (Search by name, description, and category).

[ ] Task 9: Create Product Detail page (showing price, stock, and info).

[ ] Task 10: Implement Sorting logic.

[ ] Task 11: Develop Shopping Cart (Add/Remove/Update quantity).

[ ] Task 12: Build Checkout page with Mock Payment integration.

[ ] Task 13: Automated PDF Invoice generation after purchase.

[ ] Task 14: Admin Dashboard for initial data entry.


Sprint 4: Managerial Features & Advanced Logic
------------
[ ] Task 15: Product Manager: Interface for stock updates and adding new products.

[ ] Task 16: Product Manager: Comment moderation (Approve/Reject customer reviews).

[ ] Task 17: Sales Manager: Dynamic pricing tool (Update prices/Set discounts).

[ ] Task 18: Sales Manager: Delivery tracking and Order Status updates.

[ ] Task 19: Wishlist system & Notification for price drops.

[ ] Task 20: Implement "Revenue vs. Loss" charts for Sales Managers.

[ ] Task 21: Integrate E-mail simulation for order confirmation.


Sprint 5: Returns, Reviews & Quality Assurance
------------
[ ] Task 22: Return System: 30-day refund logic with automatic stock restock.

[ ] Task 23: Customer Rating system (Star ratings and text reviews).

[ ] Task 24: Implementation of at least 25 Unit Test Cases.

[ ] Task 25: Security audit.

[ ] Task 26: Final Bug fixing and UI/UX polishing before Final Demo.

------------------
License
--------

    This project was developed for academic purposes at Sabanci University.