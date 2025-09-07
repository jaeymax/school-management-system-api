CREATE TABLE Users (
user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
username VARCHAR(50) NOT NULL,
password VARCHAR(255),
email VARCHAR(100),
role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
phone VARCHAR(20),
address TEXT,
date_of_birth DATE,
gender VARCHAR(7) NOT NULL CHECK (gender IN ('male', 'female')),
profile_image VARCHAR(255),
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Classes (
class_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
name VARCHAR(50) NOT NULL,
description TEXT,
academic_term_id INT,
teacher_id INT,
FOREIGN KEY (academic_term_id) REFERENCES academic_terms(term_id),
FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
);

CREATE TABLE Students(
    student_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    class_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (class_id) REFERENCES Classes(class_id)
);

CREATE TABLE Teachers(
  teacher_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


CREATE TABLE fee_types (
    fee_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,  -- e.g., "Tuition", "Examination", "Feeding"
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE  -- For regular fees like monthly tuition
);

CREATE TABLE academic_terms (
    term_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL,  -- e.g., "Term 1 2023"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

-- CREATE TABLE fees (
--     fee_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     student_id INT NOT NULL,
--     fee_type_id INT NOT NULL,
--     academic_term_id INT,  -- Link to school term/semester
--     amount DECIMAL(10,2) NOT NULL,
--     due_date DATE NOT NULL,
--     status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (student_id) REFERENCES students(student_id),
--     FOREIGN KEY (fee_type_id) REFERENCES fee_types(fee_type_id),
--     FOREIGN KEY (academic_term_id) REFERENCES academic_terms(term_id)
-- );

CREATE TABLE fee_payments (
    payment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fee_id INT NOT NULL REFERENCES fees(fee_id),
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'check')),
    status VARCHAR(20) CHECK (status IN ('completed', 'pending', 'failed')),
    transaction_reference VARCHAR(100),
    received_by INT REFERENCES users(user_id),  -- Admin/teacher who received the payment
    notes TEXT
);

CREATE TABLE daily_fee_payments (
    payment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feeding_id INT NOT NULL REFERENCES daily_feeding_fees(feeding_id),
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'check')),
    status VARCHAR(20) CHECK (status IN ('completed', 'pending', 'failed')),
    transaction_reference VARCHAR(100),
    received_by INT REFERENCES users(user_id),
    notes TEXT
);

-- Stores default amounts PER CLASS
CREATE TABLE fee_class_pricing (
    pricing_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fee_type_id INT NOT NULL,
    class_id INT NOT NULL,       -- Links to your "classes" table
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(fee_type_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    UNIQUE (fee_type_id, class_id)  -- Prevent duplicate entries
);


CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(student_id),
    class_id INT NOT NULL REFERENCES classes(class_id),
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    recorded_by INT REFERENCES users(user_id),  -- Teacher/admin who recorded
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, class_id, date)  -- Prevent duplicate entries
);

CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE,
    description TEXT,
    is_core BOOLEAN DEFAULT TRUE
); 

CREATE TABLE class_subjects (
    class_subject_id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(class_id),
    subject_id INT NOT NULL REFERENCES subjects(subject_id),
    UNIQUE (class_id, subject_id)
);

CREATE TABLE teacher_subjects (
    teacher_subject_id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL REFERENCES users(user_id),
    subject_id INT NOT NULL REFERENCES subjects(subject_id),
    proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('primary', 'secondary', 'expert')),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (teacher_id, subject_id)
);


CREATE TABLE teaching_assignments (
    assignment_id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(class_id),
    subject_id INT NOT NULL REFERENCES subjects(subject_id),
    teacher_id INT NOT NULL REFERENCES users(user_id),
    academic_term_id INT NOT NULL REFERENCES academic_terms(term_id),
    is_class_teacher BOOLEAN DEFAULT FALSE,
    UNIQUE (class_id, subject_id, academic_term_id)  -- One teacher per subject per class per term
);


CREATE TABLE custom_student_fees (
    custom_fee_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(student_id),
    fee_type_id INT NOT NULL REFERENCES fee_types(fee_type_id),
    custom_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE (student_id, fee_type_id)  -- One custom price per fee type per student
);