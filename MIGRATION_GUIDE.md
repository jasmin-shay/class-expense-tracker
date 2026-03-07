# ⚡ File Migration Guide

## What Changed

This guide explains which files are new/updated and what to do with them.

## ✅ File Changes Summary

### NEW FILES (Add These)
```
✨ auth.js                  # New authentication module
✨ leader-new.js            # New leader dashboard logic (replaces leader.js)
✨ student-new.js           # New student dashboard logic (replaces student.js)
✨ teacher-new.js           # New teacher dashboard logic
✨ DATABASE_SCHEMA.sql      # Database setup script
✨ SETUP_GUIDE.md           # Complete setup instructions
✨ this file
```

### UPDATED FILES (Use These Versions)
```
🔄 login-updated.html       # Use this instead of login.html
🔄 leader-updated.html      # Use this instead of leader.html
🔄 student-updated.html     # Use this instead of student.html
🔄 teacher-updated.html     # Use this (new)
```

### FILES TO KEEP
```
✓ supabase.js               # Update with YOUR Supabase credentials!
✓ style.css                 # No changes needed
✓ home.css                  # No changes needed
✓ index.html                # No changes needed
```

### FILES TO REMOVE OR ARCHIVE
```
❌ leader.js                # Replace with leader-new.js
❌ student.js               # Replace with student-new.js
❌ app.js                   # Replaced by auth.js
```

---

## 📋 Step-by-Step Migration

### Step 1: Prepare
1. Create a backup folder of existing files
2. Note down old authentication logic if customized

### Step 2: Update Core Files

#### A. Update supabase.js
Edit `supabase.js` with YOUR Supabase credentials:
```javascript
const supabaseUrl = "YOUR_PROJECT_URL";  // From Supabase dashboard
const supabaseKey = "YOUR_ANON_KEY";     // From Supabase dashboard
```

#### B. Replace HTML Files
The old versions had placeholder data. Replace them:
- `login.html` → Use `login-updated.html`
- `leader.html` → Use `leader-updated.html`
- `student.html` → Use `student-updated.html`
- **NEW**: Add `teacher-updated.html`

Steps:
```bash
# Option 1: Delete old and rename new
rm login.html
mv login-updated.html login.html

rm leader.html
mv leader-updated.html leader.html

rm student.html
mv student-updated.html student.html

# Option 2: Just use the updated versions in browser
# Edit your links to point to -updated.html files
```

#### C. Replace JavaScript Files
```bash
# Delete old
rm leader.js
rm student.js
rm app.js

# Rename new (or keep both and update HTML to link new files)
mv leader-new.js leader.js
mv student-new.js student.js
# auth.js is new, no replacement needed
```

**OR** (Safer - Keep new and old separate):
```html
<!-- In login-updated.html -->
<script src="auth.js"></script>

<!-- In leader-updated.html -->
<script src="leader-new.js"></script>

<!-- In student-updated.html -->
<script src="student-new.js"></script>

<!-- In teacher-updated.html -->
<script src="teacher-new.js"></script>
```

### Step 3: Set Up Database
1. Copy SQL from `DATABASE_SCHEMA.sql`
2. Go to Supabase dashboard → SQL Editor
3. Paste and run the SQL
4. ✅ Tables are created!

### Step 4: Add Sample Data (Optional)
Run this in Supabase SQL Editor:
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

### Step 5: Test
1. Open `index.html` in browser
2. Click "Get Started" → Goes to login page
3. Login with credentials:
   - **Student**: 1001 / 01012004
   - **Leader**: 2001 / 02022003
   - **Teacher**: admin / 1234

---

## 🔑 Key Differences from Old Version

### Old (Mock Data)
```javascript
// leader.js
let events = [
  { id: 1, reason: "Trip", amount: 1200, ... }
];
```

### New (Real Supabase)
```javascript
// leader-new.js
const { data: events } = await supabaseClient
  .from('payments')
  .select('*');
```

### Old (No Authentication)
```javascript
// app.js
if(username=="2001" && password=="02022003") {
  window.location.href="leader.html";
}
```

### New (Database Authentication)
```javascript
// auth.js
const { data: users } = await supabaseClient
  .from('users')
  .select('*')
  .eq('username', username)
  .eq('role', role)
  .single();
```

---

## 🎯 File Linking in HTML

Make sure your HTML files link to the correct JavaScript:

### login.html (or login-updated.html)
```html
<script src="supabase.js"></script>
<script src="auth.js"></script>
```

### leader.html (or leader-updated.html)
```html
<script src="supabase.js"></script>
<script src="leader-new.js"></script>  <!-- OR leader.js if you renamed -->
```

### student.html (or student-updated.html)
```html
<script src="supabase.js"></script>
<script src="student-new.js"></script>  <!-- OR student.js if you renamed -->
```

### teacher.html (or teacher-updated.html)
```html
<script src="supabase.js"></script>
<script src="teacher-new.js"></script>
```

---

## ✨ Features Now Available

✅ **Real Supabase Database**
✅ **User Authentication**
✅ **Real-time Updates**
✅ **Payment Tracking**
✅ **Student Management**
✅ **Teacher Administration**
✅ **Responsive Design**
✅ **Session Management**
✅ **Error Handling**
✅ **Toast Notifications**

---

## 🆘 Common Issues During Migration

### Issue: "Unexpected token" error
**Cause**: Old JavaScript file still being used
**Fix**: Check `<script src="...">` tags in HTML point to correct files

### Issue: "createClient is not a function"
**Cause**: supabase.js not loaded correctly
**Fix**: Ensure `<script src="supabase.js"></script>` is before other scripts

### Issue: "supabaseClient is undefined"
**Cause**: Wrong supabase.js order or credentials wrong
**Fix**: Make sure supabase.js is first script tag

### Issue: "User not found" after setup
**Cause**: Sample data not inserted
**Fix**: Run the INSERT statements in Supabase SQL Editor

---

## 📞 Getting Help

If something breaks:

1. **Check console errors**: F12 → Console tab
2. **Check Supabase credentials**: Are they correct in supabase.js?
3. **Check database exists**: Go to Supabase dashboard
4. **Check file links**: Are script src attributes correct?
5. **Clear cache**: Ctrl+Shift+Delete in browser

---

## 🎉 You're Ready!

Once migration is complete:
1. ✅ Open index.html
2. ✅ Click "Get Started"
3. ✅ Login with test credentials
4. ✅ Create a payment event
5. ✅ See it in real-time!

---

**Questions?** Check SETUP_GUIDE.md for detailed instructions.
