-- =============================================
-- Stored Procedures for Smart Clinic Management System
-- Database: cms
-- =============================================

USE cms;

-- =============================================
-- 1. Daily Appointments Report Grouped by Doctor
-- =============================================
-- Returns all appointments for a given date, grouped by doctor,
-- showing each doctor's name, specialty, and appointment count.

DELIMITER //

CREATE PROCEDURE DailyAppointmentsByDoctor(IN report_date DATE)
BEGIN
    SELECT
        d.id AS doctor_id,
        d.name AS doctor_name,
        d.specialty,
        COUNT(a.id) AS total_appointments,
        GROUP_CONCAT(
            CONCAT(p.name, ' at ', TIME_FORMAT(a.appointment_time, '%H:%i'))
            ORDER BY a.appointment_time
            SEPARATOR '; '
        ) AS appointment_details
    FROM appointment a
    JOIN doctor d ON a.doctor_id = d.id
    JOIN patient p ON a.patient_id = p.id
    WHERE DATE(a.appointment_time) = report_date
    GROUP BY d.id, d.name, d.specialty
    ORDER BY total_appointments DESC;
END //

DELIMITER ;

-- =============================================
-- 2. Doctor with Most Patients in a Specific Month
-- =============================================
-- Takes a year and month as input and returns the doctor
-- who saw the most unique patients that month.

DELIMITER //

CREATE PROCEDURE TopDoctorByMonth(IN input_year INT, IN input_month INT)
BEGIN
    SELECT
        d.id AS doctor_id,
        d.name AS doctor_name,
        d.specialty,
        d.email,
        COUNT(DISTINCT a.patient_id) AS unique_patients,
        COUNT(a.id) AS total_appointments
    FROM appointment a
    JOIN doctor d ON a.doctor_id = d.id
    WHERE YEAR(a.appointment_time) = input_year
      AND MONTH(a.appointment_time) = input_month
      AND a.status = 1
    GROUP BY d.id, d.name, d.specialty, d.email
    ORDER BY unique_patients DESC, total_appointments DESC
    LIMIT 1;
END //

DELIMITER ;

-- =============================================
-- 3. Doctor with Most Patients in a Given Year
-- =============================================
-- Takes a year as input and returns the doctor who saw
-- the most unique patients across that entire year.

DELIMITER //

CREATE PROCEDURE TopDoctorByYear(IN input_year INT)
BEGIN
    SELECT
        d.id AS doctor_id,
        d.name AS doctor_name,
        d.specialty,
        d.email,
        COUNT(DISTINCT a.patient_id) AS unique_patients,
        COUNT(a.id) AS total_appointments
    FROM appointment a
    JOIN doctor d ON a.doctor_id = d.id
    WHERE YEAR(a.appointment_time) = input_year
      AND a.status = 1
    GROUP BY d.id, d.name, d.specialty, d.email
    ORDER BY unique_patients DESC, total_appointments DESC
    LIMIT 1;
END //

DELIMITER ;


-- =============================================
-- TEST THE STORED PROCEDURES
-- =============================================

-- Test 1: Daily appointments report for May 1, 2025
-- (Doctors 1 and 2 both have appointments on this date)
CALL DailyAppointmentsByDoctor('2025-05-01');

-- Test 2: Daily appointments report for April 1, 2025
-- (Multiple doctors have completed appointments on this date)
CALL DailyAppointmentsByDoctor('2025-04-01');

-- Test 3: Top doctor by month — April 2025
-- (Most completed appointments are in April)
CALL TopDoctorByMonth(2025, 4);

-- Test 4: Top doctor by month — May 2025
-- (May appointments have status=0, so this should return empty
--  since the procedure filters on status=1)
CALL TopDoctorByMonth(2025, 5);

-- Test 5: Top doctor by year — 2025
-- (Aggregates all completed appointments across the year)
CALL TopDoctorByYear(2025);
