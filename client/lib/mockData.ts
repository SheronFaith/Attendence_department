// Mock data for the attendance management system

export interface Staff {
  id: number;
  staffName: string;
  username: string;
  password: string;
}

export interface Admin {
  id: number;
  adminName: string;
  username: string;
  password: string;
}

export interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  courseBatch: string;
  courseType: "Elective" | "Common";
  section: string;
  year: number;
  staffId: number;
}

export interface Student {
  id: number;
  studentName: string;
  studentRollNo: string;
  courseBatch: string;
  studentSection: string;
}

export interface AttendanceEntry {
  studentId: number;
  studentRollNo: string;
  studentName: string;
  status: "Present" | "OD" | "Leave";
}

export interface AttendanceRecord {
  id: number;
  courseId: number;
  courseName: string;
  date: string; // YYYY-MM-DD
  periodFrom: number;
  periodTo: number;
  entries: AttendanceEntry[];
}

export interface User {
  role: "staff" | "admin";
  id: number;
}

// Mock data
export const mockStaff: Staff[] = [
  { id: 101, staffName: "Dr. Sheron", username: "staff1", password: "pass" }
];

export const mockAdmins: Admin[] = [
  { id: 9001, adminName: "Super Admin", username: "admin", password: "adminpass" }
];

export const mockCourses: Course[] = [
  { 
    id: 1, 
    courseName: "AI in Agriculture", 
    courseCode: "AI3021", 
    courseBatch: "BATCH-A", 
    courseType: "Elective", 
    section: "B", 
    year: 4, 
    staffId: 101 
  },
  { 
    id: 2, 
    courseName: "Mathematics II", 
    courseCode: "MTH101", 
    courseBatch: "COMMON-1", 
    courseType: "Common", 
    section: "A", 
    year: 2, 
    staffId: 101 
  }
];

export const mockStudents: Student[] = [
  { id: 201, studentName: "Alice Sharma", studentRollNo: "CSE201", courseBatch: "BATCH-A", studentSection: "B" },
  { id: 202, studentName: "Ravi Kumar", studentRollNo: "CSE202", courseBatch: "BATCH-A", studentSection: "B" },
  { id: 301, studentName: "Priya Nair", studentRollNo: "CSE101", courseBatch: "COMMON-1", studentSection: "A" },
  { id: 302, studentName: "Rahul Das", studentRollNo: "CSE102", courseBatch: "COMMON-1", studentSection: "A" }
];

// Utility functions for localStorage operations
export const storageKeys = {
  user: "user",
  attendanceRecords: "attendance_records"
} as const;

export function saveUser(user: User): void {
  localStorage.setItem(storageKeys.user, JSON.stringify(user));
}

export function getUser(): User | null {
  const userStr = localStorage.getItem(storageKeys.user);
  return userStr ? JSON.parse(userStr) : null;
}

export function clearUser(): void {
  localStorage.removeItem(storageKeys.user);
}

export function saveAttendanceRecord(record: AttendanceRecord): void {
  const existingRecords = getAttendanceRecords();
  const updatedRecords = [...existingRecords, record];
  localStorage.setItem(storageKeys.attendanceRecords, JSON.stringify(updatedRecords));
}

export function getAttendanceRecords(): AttendanceRecord[] {
  const recordsStr = localStorage.getItem(storageKeys.attendanceRecords);
  return recordsStr ? JSON.parse(recordsStr) : [];
}

export function getStudentsForCourse(course: Course): Student[] {
  if (course.courseType === "Elective") {
    return mockStudents.filter(student => student.courseBatch === course.courseBatch);
  } else {
    return mockStudents.filter(student => student.studentSection === course.section);
  }
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateTimestampId(): number {
  return Date.now();
}
