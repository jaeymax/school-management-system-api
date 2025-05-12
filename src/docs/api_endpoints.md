Here’s a detailed list of API endpoints for your school management system backend. These endpoints will allow the frontend to interact with the backend for CRUD (Create, Read, Update, Delete) operations and other functionalities. I'll organize them by resource (e.g., Students, Teachers, Fees, etc.) and include the HTTP methods (GET, POST, PUT, DELETE) for each endpoint.

1. Authentication
Endpoint	Method	Description
/api/auth/register	POST	Register a new user (Admin, Teacher, Student, Parent).
/api/auth/login	POST	Log in a user and return a JWT token.
/api/auth/logout	POST	Log out the user (invalidate the token).
/api/auth/forgot-password	POST	Request a password reset link.
/api/auth/reset-password	POST	Reset the password using a token.
2. Students
Endpoint	Method	Description
/api/students	GET	Get a list of all students.
/api/students/:id	GET	Get details of a specific student.
/api/students	POST	Add a new student.
/api/students/:id	PUT	Update a student's details.
/api/students/:id	DELETE	Delete a student.
/api/students/:id/fees	GET	Get fee details for a specific student.
/api/students/:id/grades	GET	Get grades for a specific student.
/api/students/:id/attendance	GET	Get attendance records for a student.
3. Teachers
Endpoint	Method	Description
/api/teachers	GET	Get a list of all teachers.
/api/teachers/:id	GET	Get details of a specific teacher.
/api/teachers	POST	Add a new teacher.
/api/teachers/:id	PUT	Update a teacher's details.
/api/teachers/:id	DELETE	Delete a teacher.
/api/teachers/:id/classes	GET	Get classes taught by a specific teacher.
4. Classes
Endpoint	Method	Description
/api/classes	GET	Get a list of all classes.
/api/classes/:id	GET	Get details of a specific class.
/api/classes	POST	Add a new class.
/api/classes/:id	PUT	Update a class's details.
/api/classes/:id	DELETE	Delete a class.
/api/classes/:id/students	GET	Get students in a specific class.
/api/classes/:id/subjects	GET	Get subjects for a specific class.
5. Subjects
Endpoint	Method	Description
/api/subjects	GET	Get a list of all subjects.
/api/subjects/:id	GET	Get details of a specific subject.
/api/subjects	POST	Add a new subject.
/api/subjects/:id	PUT	Update a subject's details.
/api/subjects/:id	DELETE	Delete a subject.
6. Fees
Endpoint	Method	Description
/api/fees	GET	Get a list of all fee records.
/api/fees/:id	GET	Get details of a specific fee record.
/api/fees	POST	Add a new fee record.
/api/fees/:id	PUT	Update a fee record (e.g., mark as paid).
/api/fees/:id	DELETE	Delete a fee record.
/api/fees/student/:id	GET	Get fee records for a specific student.
7. Attendance
Endpoint	Method	Description
/api/attendance	GET	Get a list of all attendance records.
/api/attendance/:id	GET	Get details of a specific attendance record.
/api/attendance	POST	Add a new attendance record.
/api/attendance/:id	PUT	Update an attendance record.
/api/attendance/:id	DELETE	Delete an attendance record.
/api/attendance/student/:id	GET	Get attendance records for a specific student.
8. Grades
Endpoint	Method	Description
/api/grades	GET	Get a list of all grade records.
/api/grades/:id	GET	Get details of a specific grade record.
/api/grades	POST	Add a new grade record.
/api/grades/:id	PUT	Update a grade record.
/api/grades/:id	DELETE	Delete a grade record.
/api/grades/student/:id	GET	Get grade records for a specific student.
9. Parents
Endpoint	Method	Description
/api/parents	GET	Get a list of all parents.
/api/parents/:id	GET	Get details of a specific parent.
/api/parents	POST	Add a new parent.
/api/parents/:id	PUT	Update a parent's details.
/api/parents/:id	DELETE	Delete a parent.
/api/parents/:id/children	GET	Get children (students) of a specific parent.
10. Reports
Endpoint	Method	Description
/api/reports/fees	GET	Generate a fee report (e.g., unpaid fees).
/api/reports/attendance	GET	Generate an attendance report.
/api/reports/grades	GET	Generate a grade report for a class.
11. Notifications
Endpoint	Method	Description
/api/notifications	GET	Get all notifications for a user.
/api/notifications/:id	GET	Get details of a specific notification.
/api/notifications	POST	Send a notification (e.g., fee reminder).
/api/notifications/:id	DELETE	Delete a notification.
12. Search
Endpoint	Method	Description
/api/search/students	GET	Search for students by name, class, etc.
/api/search/teachers	GET	Search for teachers by name or subject.
/api/search/parents	GET	Search for parents by name or student.


13. Users Route Endpoints
Endpoint	Method	Description
/api/users/register	POST	Register a new user (Student, Teacher, Admin, Parent).
/api/users/login	POST	Log in a user and return a JWT token.
/api/users/logout	POST	Log out the user (invalidate the token).
/api/users/forgot-password	POST	Request a password reset link.
/api/users/reset-password	POST	Reset the password using a token.
/api/users/profile	GET	Get the logged-in user's profile.
/api/users/profile	PUT	Update the logged-in user's profile.
/api/users/:id	GET	Get details of a specific user (Admin only).
/api/users	GET	Get a list of all users (Admin only).
/api/users/:id	PUT	Update a specific user's details (Admin only).
/api/users/:id	DELETE	Delete a specific user (Admin only).
