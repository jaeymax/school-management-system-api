ALTER TABLE Users
DROP CONSTRAINT IF EXISTS users_role_check1,
ADD CONSTRAINT users_gender_check CHECK (gender IN ('male', 'female'));