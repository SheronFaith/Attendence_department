import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  mockCourses, 
  getUser, 
  getStudentsForCourse, 
  saveAttendanceRecord, 
  getCurrentDate, 
  generateTimestampId,
  type Course, 
  type Student, 
  type AttendanceEntry 
} from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AbsentModal } from '@/components/AbsentModal';
import { showToast } from '@/components/Toast';
import { ArrowLeft, Users, Calendar, Clock } from 'lucide-react';

interface StudentAttendance extends Student {
  status: 'Present' | 'OD' | 'Leave';
}

export default function StaffAttendance() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [date, setDate] = useState(getCurrentDate());
  const [periodFrom, setPeriodFrom] = useState(1);
  const [periodTo, setPeriodTo] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastToggledRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'staff') {
      navigate('/');
      return;
    }

    if (!courseId) {
      navigate('/staff');
      return;
    }

    const foundCourse = mockCourses.find(c => c.id === parseInt(courseId));
    if (!foundCourse || foundCourse.staffId !== user.id) {
      navigate('/staff');
      return;
    }

    setCourse(foundCourse);
    
    const courseStudents = getStudentsForCourse(foundCourse);
    const sortedStudents = courseStudents
      .sort((a, b) => a.studentRollNo.localeCompare(b.studentRollNo))
      .map(student => ({ ...student, status: 'Present' as const }));
    
    setStudents(sortedStudents);
  }, [courseId, navigate]);

  const handleToggle = (student: StudentAttendance, buttonRef: HTMLButtonElement) => {
    console.log('Toggle clicked for student:', student.studentName, 'Status:', student.status);
    if (student.status === 'Present') {
      console.log('Setting modal open for student:', student.studentName);
      setSelectedStudent(student);
      setIsModalOpen(true);
      lastToggledRef.current = buttonRef;
    } else {
      // Change back to Present
      setStudents(prev =>
        prev.map(s =>
          s.id === student.id
            ? { ...s, status: 'Present' }
            : s
        )
      );
    }
  };

  const handleAbsentSelect = (type: 'OD' | 'Leave') => {
    console.log('Modal selection:', type, 'for student:', selectedStudent?.studentName);
    if (selectedStudent) {
      setStudents(prev =>
        prev.map(s =>
          s.id === selectedStudent.id
            ? { ...s, status: type }
            : s
        )
      );
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
      showToast('No students found for this course', 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const entries: AttendanceEntry[] = students.map(student => ({
        studentId: student.id,
        studentRollNo: student.studentRollNo,
        studentName: student.studentName,
        status: student.status
      }));

      const attendanceRecord = {
        id: generateTimestampId(),
        courseId: course!.id,
        courseName: course!.courseName,
        date,
        periodFrom,
        periodTo,
        entries
      };

      saveAttendanceRecord(attendanceRecord);

      // TODO: Replace localStorage with API call
      // try {
      //   await axios.post('/api/staff/attendance', attendanceRecord, {
      //     headers: { Authorization: `Bearer ${token}` }
      //   });
      //   showToast('Attendance saved successfully');
      // } catch (error) {
      //   showToast('Failed to save attendance. Please try again.', 5000);
      //   return;
      // }

      showToast('Attendance saved locally. Replace with API call when backend is ready.');
      navigate('/staff');
    } catch (error) {
      showToast('Failed to save attendance. Please try again.', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/staff');
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

  const presentCount = students.filter(s => s.status === 'Present').length;
  const odCount = students.filter(s => s.status === 'OD').length;
  const leaveCount = students.filter(s => s.status === 'Leave').length;

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
                      {course.courseType} • Section {course.section} • Year {course.year}
                    </CardDescription>
                    <Badge variant={course.courseType === 'Elective' ? 'default' : 'secondary'}>
                      {course.courseType}
                    </Badge>
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
              For absent students, toggle off and choose OD or Leave when prompted.
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
                    onChange={(e) => setPeriodFrom(parseInt(e.target.value) || 1)}
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
                    <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{odCount}</p>
                    <p className="text-sm text-gray-600">OD</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{leaveCount}</p>
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toggle
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
                            <Badge 
                              variant={
                                student.status === 'Present' ? 'default' :
                                student.status === 'OD' ? 'secondary' : 'destructive'
                              }
                            >
                              {student.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggle(student, e.currentTarget as HTMLButtonElement);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleToggle(student, e.currentTarget as HTMLButtonElement);
                                }
                              }}
                              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 cursor-pointer"
                              aria-label={`Toggle attendance for ${student.studentName}. Currently ${student.status}`}
                            >
                              <Switch
                                checked={student.status === 'Present'}
                                aria-hidden="true"
                                onCheckedChange={() => {}} // Disable Switch's own onChange
                                className="pointer-events-none" // Make Switch non-interactive
                              />
                              <span className="text-xs text-gray-500">
                                {student.status === 'Present' ? 'Present' : 'Absent'}
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
                {isSubmitting ? 'Saving...' : 'Submit Attendance'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Absent Modal */}
      <AbsentModal
        open={isModalOpen}
        onClose={() => {
          console.log('Modal close triggered');
          setIsModalOpen(false);
          setSelectedStudent(null);
          setTimeout(() => {
            lastToggledRef.current?.focus();
          }, 100);
        }}
        onSelect={handleAbsentSelect}
        studentName={selectedStudent?.studentName}
      />
    </div>
  );
}
