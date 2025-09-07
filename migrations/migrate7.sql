ALTER TABLE students 
ADD COLUMN tuition_arrears DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE tuition_arrears_history (
    record_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(student_id),    
    term_id INT NOT NULL REFERENCES academic_terms(term_id),
    previous_arrears DECIMAL(10,2) NOT NULL,
    new_arrears DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    recorded_by INT REFERENCES users(user_id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

ALTER TABLE fees 
ADD COLUMN is_tuition BOOLEAN DEFAULT FALSE,
ADD COLUMN original_amount DECIMAL(10,2),
ADD COLUMN arrears_applied DECIMAL(10,2) DEFAULT 0.00;