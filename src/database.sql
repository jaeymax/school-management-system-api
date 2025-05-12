-- Users table for authentication and role-based access
CREATE TABLE Users (
user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
username VARCHAR(50) NOT NULL,
password VARCHAR(255),
email VARCHAR(100),
role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
phone VARCHAR(20),
address TEXT,
date_of_birth DATE,
gender VARCHAR(7) NOT NULL CHECK (role IN ('male', 'female')),
profile_image VARCHAR(255),
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Teachers(
  teacher_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  class_id INT,  
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
);

CREATE TABLE Students(
    student_id INT GENERATED ALWAYS AS IDENTITY AS PRIMARY KEY,
    user_id INT NOT NULL,
    class_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (class_id) REFERENCES Classes(class_id)
);


CREATE TABLE Classes (
class_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
name VARCHAR(50) NOT NULL,
description TEXT,
academic_year_id INT,
teacher_id INT,
FOREIGN KEY (academic_year_id) REFERENCES AcademicYears(academic_year_id),
FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
);


CREATE TABLE AcademicYears (
academic_year_id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(50) NOT NULL,
start_date DATE NOT NULL,
end_date DATE NOT NULL,
is_current BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



CREATE TABLE Subjects (
subject_id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
code VARCHAR(20) UNIQUE,
description TEXT
);

CREATE TABLE fee_types (
    fee_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,  -- e.g., "Tuition", "Examination", "Feeding"
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,  -- For regular fees like monthly tuition
);

CREATE TABLE fees (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    fee_class_pricing_id INT NOT NULL,  -- Link to fee_class_pricing table
    student_id INT NOT NULL,
    fee_type_id INT NOT NULL,
    academic_term_id INT,  -- Link to school term/semester
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(fee_type_id),
    FOREIGN KEY (academic_term_id) REFERENCES academic_terms(term_id),
    FOREIGN KEY (fee_class_pricing_id) REFERENCES fee_class_pricing(pricing_id)
);

CREATE TABLE daily_feeding_fees (
    feeding_id SERIAL PRIMARY KEY,
    fee_class_pricing_id INT NOT NULL,
    academic_term_id INT NOT NULL,
    student_id INT NOT NULL REFERENCES students(student_id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
        CHECK (status IN ('unpaid', 'paid', 'excused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (academic_term_id) REFERENCES academic_terms(term_id),
    FOREIGN KEY (fee_class_pricing_id) REFERENCES fee_class_pricing(pricing_id),
    UNIQUE (student_id, date)  -- One record per student per day
);

CREATE TABLE fee_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    fee_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'bank_transfer', 'mobile_money', 'check'),
    transaction_reference VARCHAR(100),
    received_by INT,  -- Staff ID who recorded the payment
    notes TEXT,
    FOREIGN KEY (fee_id) REFERENCES fees(fee_id)
);

CREATE TABLE academic_terms (
    term_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,  -- e.g., "Term 1 2023"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

-- Stores default amounts PER CLASS
CREATE TABLE fee_class_pricing (
    pricing_id INT AUTO_INCREMENT PRIMARY KEY,
    fee_type_id INT NOT NULL,
    class_id INT NOT NULL,       -- Links to your "classes" table
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(fee_type_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    UNIQUE KEY (fee_type_id, class_id)  -- Prevent duplicate entries
);