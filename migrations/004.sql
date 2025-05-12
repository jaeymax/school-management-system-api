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

-- Index for performance
CREATE INDEX idx_feeding_fees_date ON daily_feeding_fees(date);
CREATE INDEX idx_feeding_fees_student ON daily_feeding_fees(student_id);