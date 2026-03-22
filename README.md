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

*Browsing & Search: Search products by name/description and sort by price or popularity.

*Shopping Cart: Add products to the cart as a guest; login required only for checkout.

*Wishlist: Save favorite items and get notified automatically when a Sales Manager applies a discount.

*Reviews: Comment and rate products (1-5 stars/1-10 points).

*Order Tracking: Monitor status (Processing, In-transit, Delivered) and download PDF invoices.

*Returns & Refunds: Request a refund within 30 days. Automated calculation ensures the refunded amount matches the discounted price at the time of purchase.


    Sales Manager 

*Dynamic Pricing: Set prices and apply discount rates to selected products.

*Financial Analysis: Calculate revenue/profit/loss for specific date ranges with visual charts.

*Invoice Management: View, print, and export all system invoices as PDF.

Product Manager 

*Inventory Control: Add/remove products and categories, and manage live stock levels.

*Delivery Department: Oversee the delivery list (Delivery ID, Customer, Address, Status).

*Moderation: Approve or disapprove customer comments before they become public.

----------------------------------------------------------------------------------------------------------------------------------
    Tech Stack

-Frontend: [ ]

-Backend: [ ]

-Database: [ ]

-State Management: [ ]

-File Generation: [ ] for PDF invoices.

------------------------------------------------------------------------------------------------------------------------------------
    Security & Defensive Programming

*Data Encryption: All sensitive information (passwords, credit card info, invoices) is stored in an encrypted format.

*RBAC (Role-Based Access Control): Strict privilege separation between user roles.

*Concurrency Handling: Implemented to prevent race conditions during simultaneous stock updates.

*Input Validation: Sanitize all user inputs.

-------------------------------------------------------------------------------------------------------------------------------------
    Team Members

[Member Name] - [Backend Developer]

[Member Name] - [Frontend Developer]

[Member Name] - [Full Stack]

[Member Name] - [Project Managers]

-----------------------------
    License

-This project was developed for academic purposes at Sabanci University.