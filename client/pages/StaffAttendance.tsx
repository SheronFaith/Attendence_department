import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  mockCourses,
  getUser,
  getStudentsForCourse,
  saveAttendanceRecord,
  getCurrentDate,
  generateTimestampId,
  type Course,
  type Student,
  type AttendanceEntry,
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AbsentModal } from "@/components/AbsentModal";
import { showToast } from "@/components/Toast";
import { ArrowLeft, Users, Calendar, Clock } from "lucide-react";

interface StudentAttendance extends Student {
  status: "Present" | "OD" | "Leave";
}

export default function StaffAttendance() {
  const { courseId, batchId } = useParams<{
    courseId: string;
    batchId: string;
  }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [date, setDate] = useState(getCurrentDate());
  const [periodFrom, setPeriodFrom] = useState(1);
  const [periodTo, setPeriodTo] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastToggledRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "staff") {
      navigate("/");
      return;
    }

    if (!courseId || !batchId) {
      navigate("/staff");
      return;
    }

    const fetchStudents = async () => {
      try {
        const apiUrl = `https://department-attendance-backend-production.up.railway.app/api/students?courseId=${courseId}&batchId=${batchId}`;
        console.log("🚀 [STUDENTS API] Fetching students from:", apiUrl);
        console.log("📊 [PARAMS] CourseId:", courseId, "BatchId:", batchId);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(
          "📡 [STUDENTS RESPONSE] Status:",
          response.status,
          response.statusText,
        );
        console.log("📡 [STUDENTS RESPONSE] Headers:", Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const studentsData = await response.json();
          console.log(
            "✅ [STUDENTS SUCCESS] Raw API data received:",
            studentsData,
          );
          console.log(
            "👥 [STUDENTS COUNT] Number of students:",
            studentsData.length,
          );

          // Transform API data to component format
          const transformedStudents = studentsData.map((student: any) => ({
            id: student.id,
            studentName: student.name,
            studentRollNo: student.rollNumber,
            courseBatch: student.batch?.batchNo?.toString() || "",
            studentSection: student.section,
            status: "Present" as const,
          }));

          console.log(
            "🔄 [DATA TRANSFORM] Transformed students data:",
            transformedStudents,
          );

          // Set course info from first student's data
          if (studentsData.length > 0) {
            const firstStudent = studentsData[0];
            const courseInfo = {
              id: parseInt(courseId),
              courseName: firstStudent.course.courseName,
              courseCode: firstStudent.course.courseCode.toString(),
              courseBatch: firstStudent.batch?.batchNo?.toString() || "",
              courseType: "Course" as const,
              section: firstStudent.batch?.batchNo?.toString() || "",
              year: parseInt(firstStudent.semester),
              staffId: user.id,
            };

            console.log("📚 [COURSE INFO] Extracted course data:", courseInfo);
            setCourse(courseInfo);
          }

          setStudents(transformedStudents);
          console.log(
            "💾 [UI UPDATE] Students data set to state, using live API data",
          );
          return;
        } else {
          console.warn(
            "⚠️ [STUDENTS ERROR] Response not OK:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("❌ [STUDENTS FETCH ERROR] API not available:", error);
        console.log("🔄 [FALLBACK] Switching to demo students data");
      }

      // Fallback to mock students when API is not available
      console.log("🎭 [STUDENTS FALLBACK] Using demo/mock student data");
      const fallbackStudents = [
        {
          id: 1,
          studentName: "Alice",
          studentRollNo: "M101",
          courseBatch: batchId || "1",
          studentSection: "A",
          status: "Present" as const,
        },
        {
          id: 2,
          studentName: "Bob",
          studentRollNo: "M102",
          courseBatch: batchId || "1",
          studentSection: "A",
          status: "Present" as const,
        },
        {
          id: 3,
          studentName: "Charlie",
          studentRollNo: "P101",
          courseBatch: batchId || "1",
          studentSection: "B",
          status: "Present" as const,
        },
      ];

      // Set fallback course info
      const courseNames = ["Mathematics", "Physics", "Chemistry"];
      const courseName = courseNames[parseInt(courseId) - 1] || "Sample Course";

      const fallbackCourse = {
        id: parseInt(courseId),
        courseName: courseName,
        courseCode: `${100 + parseInt(courseId)}`,
        courseBatch: batchId || "1",
        courseType: "Course" as const,
        section: batchId || "1",
        year: 1,
        staffId: user.id,
      };

      setCourse(fallbackCourse);
      setStudents(fallbackStudents);

      console.log("📚 [FALLBACK COURSE] Demo course info:", fallbackCourse);
      console.log(
        "👥 [FALLBACK STUDENTS] Demo students loaded:",
        fallbackStudents,
      );
      console.log("💾 [UI UPDATE] Demo data set to state");
    };

    fetchStudents();
  }, [courseId, batchId, navigate]);

  const handleToggle = (
    student: StudentAttendance,
    buttonRef: HTMLButtonElement,
  ) => {
    if (student.status === "Present") {
      setSelectedStudent(student);
      setIsModalOpen(true);
      lastToggledRef.current = buttonRef;
    } else {
      // Change back to Present
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, status: "Present" } : s,
        ),
      );
    }
  };

  const handleAbsentSelect = (type: "OD" | "Leave") => {
    console.log(
      "handleAbsentSelect called with:",
      type,
      "selectedStudent:",
      selectedStudent?.studentName,
    );
    if (selectedStudent) {
      const studentId = selectedStudent.id; // Capture the ID before clearing selectedStudent

      setStudents((prev) => {
        const newStudents = prev.map((s) =>
          s.id === studentId ? { ...s, status: type } : s,
        );
        return newStudents;
      });

      // Force a re-render
      setForceUpdate((prev) => prev + 1);
    }
    setIsModalOpen(false);
    setSelectedStudent(null);

    // Return focus to the toggled button
    setTimeout(() => {
      lastToggledRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (students.length === 0) {
      showToast("No students found for this course", 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(
        "📤 [ATTENDANCE SUBMIT] Starting attendance submission process",
      );

      // Transform student status to API format
      const statusMap = {
        Present: "PRESENT",
        OD: "OD",
        Leave: "ABSENT",
      };
      console.log("🔄 [STATUS MAP] Using status mapping:", statusMap);

      const attendanceList = students.map((student) => ({
        studentId: student.id,
        status: statusMap[student.status] || "PRESENT",
      }));
      console.log(
        "👥 [ATTENDANCE LIST] Transformed attendance data:",
        attendanceList,
      );

      const attendanceData = {
        courseId: parseInt(courseId!),
        batchId: parseInt(batchId!),
        date: date,
        time: `${periodFrom.toString().padStart(2, "0")}:30:00`, // Convert period to time format
        attendanceList,
      };
      console.log(
        "📊 [SUBMISSION DATA] Complete attendance payload:",
        attendanceData,
      );

      // Try to submit to API first
      try {
        const apiUrl = "https://department-attendance-backend-production.up.railway.app/attendance/mark";
        console.log("🚀 [ATTENDANCE API] Submitting to:", apiUrl);
        console.log(
          "📤 [REQUEST BODY]:",
          JSON.stringify(attendanceData, null, 2),
        );

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendanceData),
        });

        console.log(
          "📡 [ATTENDANCE RESPONSE] Status:",
          response.status,
          response.statusText,
        );

        if (response.ok) {
          const responseData = await response.text();
          console.log("�� [ATTENDANCE SUCCESS] Response data:", responseData);
          showToast("Attendance saved successfully!");
          navigate("/staff");
          return;
        } else {
          console.warn(
            "⚠️ [ATTENDANCE ERROR] Response not OK:",
            response.status,
            response.statusText,
          );
        }
      } catch (apiError) {
        console.error(
          "❌ [ATTENDANCE API ERROR] API submission failed:",
          apiError,
        );
        console.log("🔄 [FALLBACK] Switching to local storage");
      }

      // Fallback to localStorage when API is not available
      console.log(
        "💾 [LOCAL STORAGE] Creating local attendance record as fallback",
      );
      const localAttendanceRecord = {
        id: Date.now(),
        courseId: parseInt(courseId!),
        batchId: parseInt(batchId!),
        courseName: course?.courseName || "Unknown Course",
        date,
        periodFrom,
        periodTo,
        entries: students.map((student) => ({
          studentId: student.id,
          studentRollNo: student.studentRollNo,
          studentName: student.studentName,
          status: student.status,
        })),
      };
      console.log(
        "📋 [LOCAL RECORD] Local attendance data:",
        localAttendanceRecord,
      );

      // Save to localStorage as fallback
      const existingRecords = JSON.parse(
        localStorage.getItem("attendance_records") || "[]",
      );
      console.log(
        "📚 [EXISTING RECORDS] Current stored records count:",
        existingRecords.length,
      );

      existingRecords.push(localAttendanceRecord);
      localStorage.setItem(
        "attendance_records",
        JSON.stringify(existingRecords),
      );

      console.log("✅ [LOCAL STORAGE SUCCESS] Attendance saved locally");
      console.log(
        "📊 [TOTAL RECORDS] New total records count:",
        existingRecords.length,
      );

      showToast("Attendance saved locally (API unavailable)");
      navigate("/staff");
    } catch (error) {
      console.error("Error saving attendance:", error);
      showToast("Failed to save attendance. Please try again.", 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/staff");
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const presentCount = students.filter((s) => s.status === "Present").length;
  const odCount = students.filter((s) => s.status === "OD").length;
  const leaveCount = students.filter((s) => s.status === "Leave").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/staff"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Course Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">
                    {course.courseName} ({course.courseCode})
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <CardDescription>
                      {course.courseType} • Section {course.section} • Year{" "}
                      {course.year}
                    </CardDescription>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        course.courseType === "Elective"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.courseType}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {students.length} students
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Instructions:</strong> All students default to Present.
              For absent students, toggle off and choose OD or Leave when
              prompted.
            </p>
          </div>

          {/* Attendance Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Period */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attendance Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodFrom">Period From</Label>
                  <Input
                    id="periodFrom"
                    type="number"
                    min="1"
                    max="10"
                    value={periodFrom}
                    onChange={(e) =>
                      setPeriodFrom(parseInt(e.target.value) || 1)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodTo">Period To</Label>
                  <Input
                    id="periodTo"
                    type="number"
                    min="1"
                    max="10"
                    value={periodTo}
                    onChange={(e) => setPeriodTo(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {presentCount}
                    </p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {odCount}
                    </p>
                    <p className="text-sm text-gray-600">OD</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {leaveCount}
                    </p>
                    <p className="text-sm text-gray-600">Leave</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {student.studentRollNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggle(
                                  student,
                                  e.currentTarget as HTMLButtonElement,
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleToggle(
                                    student,
                                    e.currentTarget as HTMLButtonElement,
                                  );
                                }
                              }}
                              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 cursor-pointer"
                              aria-label={`Toggle attendance for ${student.studentName}. Currently ${student.status}`}
                            >
                              <Switch
                                key={`${student.id}-${student.status}-${forceUpdate}`}
                                checked={student.status === "Present"}
                                aria-hidden="true"
                                onCheckedChange={() => {}} // Disable Switch's own onChange
                                className="pointer-events-none" // Make Switch non-interactive
                              />
                              <span
                                className={`text-xs font-medium ${
                                  student.status === "Present"
                                    ? "text-green-600"
                                    : student.status === "OD"
                                      ? "text-blue-600"
                                      : "text-red-600"
                                }`}
                              >
                                {student.status === "Present"
                                  ? "Present"
                                  : student.status === "OD"
                                    ? "OD"
                                    : "Leave"}
                                {/* Debug: show actual status */}
                                <span className="text-xs text-gray-400 ml-1">
                                  ({student.status})
                                </span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="sm:w-auto"
              >
                {isSubmitting ? "Saving..." : "Submit Attendance"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Absent Modal */}
      <AbsentModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        onSelect={handleAbsentSelect}
        studentName={selectedStudent?.studentName}
      />
    </div>
  );
}
