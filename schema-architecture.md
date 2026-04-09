# Schema & Architecture

## Section 1: Architecture Summary

This Spring Boot application follows a layered architecture combining MVC and REST patterns. Thymeleaf-based MVC controllers power the Admin and Doctor dashboards, rendering server-side HTML views for tasks such as managing users, viewing schedules, and handling appointments. REST controllers expose JSON APIs for the remaining modules -- including Patient registration, Appointment booking, and Prescription management -- enabling frontend or mobile clients to interact with the system.

The application connects to two distinct databases. MySQL stores relational data for patients, doctors, appointments, and admin accounts using JPA entities managed through Spring Data JPA repositories. MongoDB stores prescription documents using Spring Data MongoDB repositories and document-based models. All controllers -- whether MVC or REST -- delegate business logic to a shared service layer, which coordinates between the appropriate JPA or MongoDB repositories depending on the data being accessed. This separation of concerns keeps controllers thin, centralizes business rules in services, and allows each database technology to be used where it fits best.

## Section 2: Numbered Flow of Data and Control

1. The user accesses the application through a browser -- either navigating to an Admin/Doctor dashboard page or making a request to a REST API endpoint (e.g., booking an appointment or submitting a prescription).
2. The request is routed by Spring Boot's DispatcherServlet to the appropriate controller: a Thymeleaf MVC controller for dashboard views, or a REST controller for API-based operations.
3. The controller receives the request, validates any incoming data, and delegates the business logic to the corresponding service layer class.
4. The service layer processes the request -- applying business rules, orchestrating operations, and determining which repository to call based on the data domain.
5. The service calls the appropriate repository: a Spring Data JPA repository for MySQL-backed entities (patients, doctors, appointments, admins) or a Spring Data MongoDB repository for prescription documents.
6. The repository executes the database operation -- querying, inserting, updating, or deleting data -- and returns the result back to the service layer.
7. The service returns the processed result to the controller, which either renders a Thymeleaf template with the data (for MVC dashboard views) or serializes the response as JSON (for REST API endpoints) and sends it back to the user.