-- =============================================
-- Stored Procedures for Smart Clinic Management System
-- Database: cms
-- =============================================

USE cms;

-- =============================================
-- 1. GetDailyAppointmentReportByDoctor
-- =============================================
-- Returns all appointment rows for a given date, grouped by doctor,
-- showing doctor name, appointment time, status, patient name, and patient phone.

DELIMITER //

CREATE PROCEDURE GetDailyAppointmentReportByDoctor(IN report_date DATE)
BEGIN
    SELECT
        d.name AS doctor_name,
        a.appointment_time,
        a.status,
        p.name AS patient_name,
        p.phone AS patient_phone
    FROM appointment a
    JOIN doctor d ON a.doctor_id = d.id
    JOIN patient p ON a.patient_id = p.id
    WHERE DATE(a.appointment_time) = report_date
    ORDER BY d.name, a.appointment_time;
END //

DELIMITER ;

-- =============================================
-- 2. GetDoctorWithMostPatientsByMonth
-- =============================================
-- Takes a year and month as input and returns the doctor
-- who saw the most patients that month, with doctor_id and patients_seen.

DELIMITER //

CREATE PROCEDURE GetDoctorWithMostPatientsByMonth(IN input_year INT, IN input_month INT)
BEGIN
    SELECT
        d.id AS doctor_id,
        d.name AS doctor_name,
        COUNT(DISTINCT a.patient_id) AS patients_seen
    FROM appointment a
    JOIN doctor d ON a.doctor_id = d.id
    WHERE YEAR(a.appointment_time) = input_year
      AND MONTH(a.appointment_time) = input_month
      AND a.status = 1
    GROUP BY d.id, d.name
    ORDER BY patients_seen DESC
    LIMIT 1;
END //

DELIMITER ;

-- =============================================
-- 3. GetDoctorWithMostPatientsByYear
-- =============================================
-- Takes a year as input and returns the doctor who saw
-- the most patients across that entire year, with doctor_id and patients_seen.

DELIMITER //

CREATE PROCEDURE GetDoctorWithMostPatientsByYear(IN input_year INT)
BEGIN
    SELECT
        d.id AS doctor_id,
        d.name AS doctor_name,
        COUNT(DISTINCT a.patient_id) AS patients_seen
    FROM appointment a
    JOIN doctor d ON a.doctor_id = d.id
    WHERE YEAR(a.appointment_time) = input_year
      AND a.status = 1
    GROUP BY d.id, d.name
    ORDER BY patients_seen DESC
    LIMIT 1;
END //

DELIMITER ;


-- =============================================
-- TEST THE STORED PROCEDURES
-- =============================================

-- Test 1: Daily appointments report for April 1, 2025
CALL GetDailyAppointmentReportByDoctor('2025-04-01');

-- Test 2: Daily appointments report for May 1, 2025
CALL GetDailyAppointmentReportByDoctor('2025-05-01');

-- Test 3: Doctor with most patients in April 2025
CALL GetDoctorWithMostPatientsByMonth(2025, 4);

-- Test 4: Doctor with most patients in year 2025
CALL GetDoctorWithMostPatientsByYear(2025);
