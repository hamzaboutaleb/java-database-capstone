# Schema Design

## MySQL Database Design

MySQL is used for structured, relational data where referential integrity and consistency are critical -- patients, doctors, appointments, and admin accounts all have well-defined relationships that benefit from foreign keys and constraints.

### Table: patients

| Column          | Data Type        | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | BIGINT           | PRIMARY KEY, AUTO_INCREMENT        |
| first_name      | VARCHAR(100)     | NOT NULL                           |
| last_name       | VARCHAR(100)     | NOT NULL                           |
| email           | VARCHAR(255)     | NOT NULL, UNIQUE                   |
| password        | VARCHAR(255)     | NOT NULL                           |
| phone           | VARCHAR(20)      | NOT NULL                           |
| date_of_birth   | DATE             | NOT NULL                           |
| gender          | ENUM('M','F')    | NOT NULL                           |
| address         | VARCHAR(500)     |                                    |
| created_at      | TIMESTAMP        | NOT NULL, DEFAULT CURRENT_TIMESTAMP|

<!-- Patients are central to the system. Email is unique to prevent duplicate accounts. Password is stored as a hash. -->

### Table: doctors

| Column          | Data Type        | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | BIGINT           | PRIMARY KEY, AUTO_INCREMENT        |
| first_name      | VARCHAR(100)     | NOT NULL                           |
| last_name       | VARCHAR(100)     | NOT NULL                           |
| email           | VARCHAR(255)     | NOT NULL, UNIQUE                   |
| password        | VARCHAR(255)     | NOT NULL                           |
| phone           | VARCHAR(20)      | NOT NULL                           |
| specialization  | VARCHAR(200)     | NOT NULL                           |
| created_at      | TIMESTAMP        | NOT NULL, DEFAULT CURRENT_TIMESTAMP|

<!-- Doctors have a specialization field so patients can book by medical specialty. Email uniqueness prevents duplicate doctor accounts. -->

### Table: appointments

| Column          | Data Type        | Constraints                                        |
|-----------------|------------------|----------------------------------------------------|
| id              | BIGINT           | PRIMARY KEY, AUTO_INCREMENT                        |
| patient_id      | BIGINT           | NOT NULL, FOREIGN KEY REFERENCES patients(id)      |
| doctor_id       | BIGINT           | NOT NULL, FOREIGN KEY REFERENCES doctors(id)       |
| appointment_date| DATE             | NOT NULL                                           |
| appointment_time| TIME             | NOT NULL                                           |
| status          | ENUM('SCHEDULED','COMPLETED','CANCELLED') | NOT NULL, DEFAULT 'SCHEDULED' |
| reason          | VARCHAR(500)     |                                                    |
| created_at      | TIMESTAMP        | NOT NULL, DEFAULT CURRENT_TIMESTAMP                |

<!-- Appointments link patients to doctors with foreign keys enforcing referential integrity. Status uses an ENUM to restrict values to valid states. Date and time are separated to allow flexible querying (e.g., all appointments on a given date regardless of time). -->

### Table: admins

| Column          | Data Type        | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | BIGINT           | PRIMARY KEY, AUTO_INCREMENT        |
| username        | VARCHAR(100)     | NOT NULL, UNIQUE                   |
| email           | VARCHAR(255)     | NOT NULL, UNIQUE                   |
| password        | VARCHAR(255)     | NOT NULL                           |
| role            | VARCHAR(50)      | NOT NULL, DEFAULT 'ADMIN'          |
| created_at      | TIMESTAMP        | NOT NULL, DEFAULT CURRENT_TIMESTAMP|

<!-- Admins are stored in a separate table rather than mixing with patients/doctors because their access patterns and permissions are fundamentally different. The role column allows for future role granularity (e.g., SUPER_ADMIN). -->

### Relationships

- `appointments.patient_id` -> `patients.id` (Many-to-One: many appointments belong to one patient)
- `appointments.doctor_id` -> `doctors.id` (Many-to-One: many appointments belong to one doctor)

---

## MongoDB Collection Design

MongoDB is used for data that is document-oriented, semi-structured, or benefits from nested/embedded fields. Prescriptions are a good fit because each prescription can contain a variable number of medications with different attributes, and they are typically read as a whole document rather than joined across tables.

### Collection: prescriptions

```json
{
  "_id": "ObjectId('663f1a2b4e7c9d001a2b3c4d')",
  "patientId": 12,
  "doctorId": 3,
  "appointmentId": 47,
  "dateIssued": "2026-04-09",
  "diagnosis": "Acute bronchitis with secondary bacterial infection",
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food"
    },
    {
      "name": "Dextromethorphan Syrup",
      "dosage": "10ml",
      "frequency": "2 times daily",
      "duration": "5 days",
      "instructions": "Take before bedtime if cough persists"
    }
  ],
  "notes": "Patient is allergic to penicillin alternatives -- amoxicillin confirmed safe after allergy review. Follow up in one week if symptoms do not improve.",
  "followUpDate": "2026-04-16",
  "createdAt": "2026-04-09T10:30:00Z"
}
```

### Why MongoDB for Prescriptions

- **Variable structure**: Each prescription can have a different number of medications, each with its own dosage and instructions. Embedding these as an array avoids the need for a separate join table in MySQL.
- **Read-heavy, write-once pattern**: Prescriptions are created once and read many times as a complete document. MongoDB excels at returning entire documents without joins.
- **Flexible schema**: If future requirements add new fields (e.g., pharmacy details, refill counts), MongoDB allows this without altering a table schema or running migrations.
- **Reference by ID**: `patientId`, `doctorId`, and `appointmentId` store numeric references to MySQL records, keeping the relational data in MySQL while letting MongoDB handle the document-oriented prescription data.