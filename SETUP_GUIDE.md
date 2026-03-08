# Class Expense Tracker - Complete Setup Guide

## 📋 Overview

This is a fully functional class expense tracker with:
- **Frontend**: Modern, responsive UI with real-time updates
- **Backend**: Supabase (PostgreSQL database + authentication)
- **Roles**: Students, Class Leaders (payment creators), Teachers (admin)

## 🚀 Quick Start

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Get your API credentials from **Project Settings → API**:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key** (public key): `sb_publishable_xxxxx`

4. Update `supabase.js` with your credentials:
```javascript
const supabaseUrl = "YOUR_PROJECT_URL";
const supabaseKey = "YOUR_ANON_KEY";
```

### Step 2: Initialize Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query and run the SQL from `DATABASE_SCHEMA.sql`
3. This will create all necessary tables and indexes

### Step 3: Add Sample Data (Optional)

In Supabase SQL Editor, uncomment and run the sample data insertion at the bottom of `DATABASE_SCHEMA.sql`:

```sql
INSERT INTO users (username, password_hash, role, full_name, class)
VALUES 
  ('1001', '01012004', 'student', 'Arjun Sharma', '12A'),
  ('1002', '02022004', 'student', 'Priya Nair', '12A'),
  ('2001', '02022003', 'leader', 'Rohan Mehta', '12A'),
  ('admin', '1234', 'teacher', 'Teacher Admin', '12A');

INSERT INTO students (name, class, user_id)
VALUES 
  ('Arjun Sharma', '12A', 1),
  ('Priya Nair', '12A', 2);
```

## 📁 File Structure

```
class-expense-tracker/
├── index.html              # Home page
├── login-updated.html      # Login page (use this version)
├── leader-updated.html     # Leader dashboard (use this version)
├── student-updated.html    # Student dashboard (use this version)
├── teacher-updated.html    # Teacher dashboard (use this version)
│
├── auth.js                 # Authentication logic
├── leader-new.js           # Leader dashboard logic (use this version)
├── student-new.js          # Student dashboard logic (use this version)
├── teacher-new.js          # Teacher dashboard logic (use this version)
│
├── supabase.js             # Supabase initialization (UPDATE WITH YOUR KEYS)
├── style.css               # Login page styles
├── home.css                # Home page styles
├── leader.css              # Leader page styles
├── student.css             # Student page styles
│
└── DATABASE_SCHEMA.sql     # Database setup script
```

## 🔐 User Credentials (Demo)

When you add sample data, use these credentials to login:

### Student
- **Username**: `1001`
- **Password**: `01012004`
- **Role**: Student

### Class Leader
- **Username**: `2001`
- **Password**: `02022003`
- **Role**: Leader

### Teacher
- **Username**: `admin`
- **Password**: `1234`
- **Role**: Teacher

## 📚 Database Schema

### Users Table
Stores all user accounts
- `id`: Primary key
- `username`: Login username
- `password_hash`: Hashed password
- `role`: student | leader | teacher
- `full_name`: Display name
- `class`: Class identifier

### Students Table
Stores student information
- `id`: Primary key
- `name`: Student name
- `class`: Class identifier
- `roll_number`: Roll number
- `user_id`: Foreign key to users table

### Payments Table
Stores payment events created by leaders
- `id`: Primary key
- `reason`: Payment reason (e.g., "Annual Trip")
- `amount`: Amount in rupees
- `upi`: UPI ID or payment link
- `created_by`: Leader's user ID
- `created_at`: Creation timestamp

### Student_Payments Table
Tracks individual payment status
- `id`: Primary key
- `payment_id`: Foreign key to payments
- `student_id`: Foreign key to students
- `student_name`: Student name (for quick access)
- `status`: unpaid | pending | paid
- `payment_date`: Date of payment

## 🎯 Features by Role

### 👨‍🎓 Student
- View all pending payments for their class
- See payment details (amount, deadline, UPI)
- Mark payment as "pending" after payment
- View payment status

### 👥 Class Leader
- Create new payment events
- View all students in payment
- Track payment status for each student
- Update student payment status (unpaid → pending → paid)
- Delete student from payment

### 👨‍🏫 Teacher
- View overview statistics (total classes, students, payments)
- View all payments across classes
- View class-wise student list
- Track collection rates
- Monitor payment status

## 🔧 How It Works

### Authentication Flow
1. User enters credentials on login page
2. `auth.js` queries the users table
3. Password is verified (simple comparison in demo)
4. User session is saved in localStorage
5. Redirected to appropriate dashboard

### Payment Flow
1. Leader creates payment event with reason, amount, UPI
2. All students in the class are added to the payment (status: unpaid)
3. Students see the payment in their dashboard
4. Students mark as pending after payment
5. Leader verifies and marks as paid
6. Teacher can view overall collection rate

### Real-Time Updates
The app uses Supabase's real-time subscriptions:
- When a payment is created, it appears immediately
- When a student payment status changes, it updates in real-time
- No page refresh needed

## 🛠️ Development Tips

### Enable RLS (Row Level Security)
For production, enable RLS in Supabase:
1. Go to **Authentication → Policies**
2. Set policies for each table (optional for demo)

### Improve Password Hashing
In production, implement proper password hashing:
```javascript
// Use bcryptjs or similar
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

### Deploy Your App
1. **Vercel** (recommended for Next.js)
2. **GitHub Pages** (for static files)
3. **Netlify** (simple drag-and-drop)

## 📝 Customization

### Change Styling
- Edit `style.css`, `home.css`, `leader.css`, `student.css`
- Colors are defined in CSS variables (--bg, --accent, etc.)

### Add More Fields
1. Update database schema in Supabase
2. Update HTML forms to include new fields
3. Update JavaScript to handle new fields

### Add Email Notifications
1. Set up Supabase email or SendGrid
2. Create edge functions to send emails
3. Call from your JavaScript

## 🆘 Troubleshooting

### "User not found" error
- Check username spelling
- Make sure user role matches selected role
- Verify data exists in users table

### Payments not showing
- Check if students are added to student_payments table
- Verify payment_id is correct
- Check browser console for errors

### Real-time updates not working
- Check Supabase subscription is active
- Verify table permissions allow SELECT
- Check browser console for errors

### CORS errors
- Supabase handles this automatically
- If issues persist, check API key is correct

## 📞 Support

For issues or features:
1. Check browser console (F12 → Console tab)
2. Check Supabase logs in dashboard
3. Verify all credentials are correct
4. Clear localStorage and retry

## 📦 What's Included

✅ Complete frontend with multiple dashboards
✅ Full Supabase backend integration
✅ Real-time updates
✅ Payment tracking and history
✅ Role-based access (Student, Leader, Teacher)
✅ Responsive design (mobile, tablet, desktop)
✅ Dark mode theme
✅ Authentication system
✅ Database schema
✅ Sample data

## 🚀 Next Steps

1. Set up Supabase project
2. Add sample data
3. Test each role's features
4. Customize for your school
5. Deploy to production

---

**Happy tracking!** 🎉

Last updated: March 2024
