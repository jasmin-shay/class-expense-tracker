<<<<<<< HEAD
-- ═════════════════════════════════════════════════════════════════
-- CLASS EXPENSE TRACKER - SUPABASE DATABASE SCHEMA
-- ═════════════════════════════════════════════════════════════════

-- 1. USERS TABLE (Leaders, Teachers, Students)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'leader', 'teacher')),
  full_name TEXT,
  class TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  roll_number TEXT,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PAYMENTS TABLE (Payment events created by leaders)
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  reason TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  upi TEXT NOT NULL,
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. STUDENT_PAYMENTS TABLE (Track individual payment statuses)
CREATE TABLE IF NOT EXISTS student_payments (
  id BIGSERIAL PRIMARY KEY,
  payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'pending', 'paid')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_date TIMESTAMP
);

-- 5. PAYMENT_HISTORY TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS payment_history (
  id BIGSERIAL PRIMARY KEY,
  student_payment_id BIGINT NOT NULL REFERENCES student_payments(id) ON DELETE CASCADE,
  status_from TEXT,
  status_to TEXT NOT NULL,
  changed_by BIGINT REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═════════════════════════════════════════════════════════════════

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_payments_created_by ON payments(created_by);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_student_payments_payment_id ON student_payments(payment_id);
CREATE INDEX idx_student_payments_status ON student_payments(status);
CREATE INDEX idx_payment_history_student_payment_id ON payment_history(student_payment_id);

-- ═════════════════════════════════════════════════════════════════
-- VIEW FOR PAYMENT SUMMARIES
-- ═════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW payment_summaries AS
SELECT
  p.id as payment_id,
  p.reason,
  p.amount,
  p.upi,
  u.username as created_by_username,
  p.created_at,
  COUNT(*) as total_students,
  SUM(CASE WHEN sp.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
  SUM(CASE WHEN sp.status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
  SUM(CASE WHEN sp.status = 'pending' THEN 1 ELSE 0 END) as pending_count
FROM payments p
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN student_payments sp ON p.id = sp.payment_id
GROUP BY p.id, u.username;

-- ═════════════════════════════════════════════════════════════════
-- INSERT SAMPLE DATA (OPTIONAL - for testing)
-- ═════════════════════════════════════════════════════════════════

-- INSERT INTO users (username, password_hash, role, full_name, class)
-- VALUES 
--   ('1001', 'hashed_password_1', 'student', 'Arjun Sharma', '12A'),
--   ('1002', 'hashed_password_2', 'student', 'Priya Nair', '12A'),
--   ('2001', 'hashed_password_3', 'leader', 'Rohan Mehta', '12A'),
--   ('admin', 'hashed_password_4', 'teacher', 'Teacher Admin', '12A');

-- INSERT INTO students (name, class, user_id)
-- VALUES 
--   ('Arjun Sharma', '12A', 1),
--   ('Priya Nair', '12A', 2);

-- INSERT INTO payments (reason, amount, upi, created_by)
-- VALUES 
--   ('Annual Trip', 1200, 'leader@upi', 3),
--   ('Sports Kit', 350, 'https://pay.example.com/qr123', 3);

-- ═════════════════════════════════════════════════════════════════
-- SETUP COMPLETE
-- ═════════════════════════════════════════════════════════════════
=======
-- ═════════════════════════════════════════════════════════════════
-- CLASS EXPENSE TRACKER - SUPABASE DATABASE SCHEMA
-- ═════════════════════════════════════════════════════════════════

-- 1. USERS TABLE (Leaders, Teachers, Students)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'leader', 'teacher')),
  full_name TEXT,
  class TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  roll_number TEXT,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PAYMENTS TABLE (Payment events created by leaders)
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  reason TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  upi TEXT NOT NULL,
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. STUDENT_PAYMENTS TABLE (Track individual payment statuses)
CREATE TABLE IF NOT EXISTS student_payments (
  id BIGSERIAL PRIMARY KEY,
  payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'pending', 'paid')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_date TIMESTAMP
);

-- 5. PAYMENT_HISTORY TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS payment_history (
  id BIGSERIAL PRIMARY KEY,
  student_payment_id BIGINT NOT NULL REFERENCES student_payments(id) ON DELETE CASCADE,
  status_from TEXT,
  status_to TEXT NOT NULL,
  changed_by BIGINT REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═════════════════════════════════════════════════════════════════

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_payments_created_by ON payments(created_by);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_student_payments_payment_id ON student_payments(payment_id);
CREATE INDEX idx_student_payments_status ON student_payments(status);
CREATE INDEX idx_payment_history_student_payment_id ON payment_history(student_payment_id);

-- ═════════════════════════════════════════════════════════════════
-- VIEW FOR PAYMENT SUMMARIES
-- ═════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW payment_summaries AS
SELECT
  p.id as payment_id,
  p.reason,
  p.amount,
  p.upi,
  u.username as created_by_username,
  p.created_at,
  COUNT(*) as total_students,
  SUM(CASE WHEN sp.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
  SUM(CASE WHEN sp.status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
  SUM(CASE WHEN sp.status = 'pending' THEN 1 ELSE 0 END) as pending_count
FROM payments p
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN student_payments sp ON p.id = sp.payment_id
GROUP BY p.id, u.username;

-- ═════════════════════════════════════════════════════════════════
-- INSERT SAMPLE DATA (OPTIONAL - for testing)
-- ═════════════════════════════════════════════════════════════════

-- INSERT INTO users (username, password_hash, role, full_name, class)
-- VALUES 
--   ('1001', 'hashed_password_1', 'student', 'Arjun Sharma', '12A'),
--   ('1002', 'hashed_password_2', 'student', 'Priya Nair', '12A'),
--   ('2001', 'hashed_password_3', 'leader', 'Rohan Mehta', '12A'),
--   ('admin', 'hashed_password_4', 'teacher', 'Teacher Admin', '12A');

-- INSERT INTO students (name, class, user_id)
-- VALUES 
--   ('Arjun Sharma', '12A', 1),
--   ('Priya Nair', '12A', 2);

-- INSERT INTO payments (reason, amount, upi, created_by)
-- VALUES 
--   ('Annual Trip', 1200, 'leader@upi', 3),
--   ('Sports Kit', 350, 'https://pay.example.com/qr123', 3);

-- ═════════════════════════════════════════════════════════════════
-- SETUP COMPLETE
-- ═════════════════════════════════════════════════════════════════
>>>>>>> 0c8568dca3fa4766446fd6e9f46f665c9dff2b75
