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