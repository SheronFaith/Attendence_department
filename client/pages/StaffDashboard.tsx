import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearUser } from "@/lib/mockData";

// API interfaces
interface ApiBatch {
  batchId: number;
  batchNo: number;
  roomNo: string;
}

interface ApiCourse {
  courseId: number;
  courseName: string;
  courseCode: number;
  roomNo: string;
  batches: ApiBatch[] | null;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search } from "lucide-react";

export default function StaffDashboard() {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ApiCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffName, setStaffName] = useState("");
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "staff") {
      navigate("/");
      return;
    }

    const fetchCourses = async () => {
      try {
        const apiUrl = 'http://localhost:8080/courses/with-batches';
        console.log('🚀 [API CALL] Fetching courses from:', apiUrl);

        const response = await fetch(apiUrl);
        console.log('📡 [API RESPONSE] Status:', response.status, response.statusText);

        if (response.ok) {
          const coursesData: ApiCourse[] = await response.json();
          console.log('✅ [API SUCCESS] Courses data received:', coursesData);
          console.log('📊 [API DATA] Number of courses:', coursesData.length);

          setCourses(coursesData);
          setFilteredCourses(coursesData);
          setUsingFallbackData(false);
          console.log('💾 [UI UPDATE] Courses data set to state, using live API data');
          return;
        } else {
          console.warn('⚠️ [API ERROR] Response not OK:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ [API FETCH ERROR] API not available:', error);
        console.log('🔄 [FALLBACK] Switching to demo data');
      }

      // Fallback to mock data when API is not available
      console.log('🎭 [FALLBACK MODE] Using demo/mock data instead of API');
      setUsingFallbackData(true);
      const fallbackCourses: ApiCourse[] = [
        {
          courseId: 1,
          courseName: "Mathematics",
          courseCode: 101,
          roomNo: "C101",
          batches: [
            {
              batchId: 1,
              batchNo: 1,
              roomNo: "B101"
            },
            {
              batchId: 2,
              batchNo: 2,
              roomNo: "B102"
            }
          ]
        },
        {
          courseId: 2,
          courseName: "Physics",
          courseCode: 102,
          roomNo: "C102",
          batches: [
            {
              batchId: 3,
              batchNo: 1,
              roomNo: "B201"
            }
          ]
        },
        {
          courseId: 3,
          courseName: "Chemistry",
          courseCode: 103,
          roomNo: "C103",
          batches: null
        }
      ];

      setCourses(fallbackCourses);
      setFilteredCourses(fallbackCourses);
    };

    fetchCourses();
    setStaffName("Dr. Sheron Faith"); // In real app, get from user data
  }, [navigate]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const handleLogout = () => {
    clearUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Staff Dashboard
              </h1>
              <p className="text-sm text-gray-600">Welcome, {staffName}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Title and Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Assigned Courses
            </h2>
            <p className="text-gray-600 mt-1">
              Select a course to mark attendance. Date will be auto-filled on
              the next screen.
            </p>
            {usingFallbackData && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ Using demo data - API server not available. Connect to your backend API for live data.
                </p>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by course name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>


          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCourses.flatMap((course) =>
                        course.batches && course.batches.length > 0
                          ? course.batches.map((batch) => (
                              <tr key={`${course.courseId}-${batch.batchId}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {course.courseName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                  {course.courseCode}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Batch {batch.batchNo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {batch.roomNo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Link to={`/staff/attendance/${course.courseId}/${batch.batchId}`}>
                                    <Button size="sm">Mark Attendance</Button>
                                  </Link>
                                </td>
                              </tr>
                            ))
                          : [
                              <tr key={course.courseId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {course.courseName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                  {course.courseCode}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  No Batches
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {course.roomNo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Button size="sm" disabled>
                                    No Batches
                                  </Button>
                                </td>
                              </tr>
                            ]
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View - Visible on mobile and tablet */}
          <div className="grid gap-4 lg:hidden">
            {filteredCourses.flatMap((course) =>
              course.batches && course.batches.length > 0
                ? course.batches.map((batch) => (
                    <Card key={`${course.courseId}-${batch.batchId}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {course.courseName}
                              </h3>
                              <p className="text-sm text-gray-500 font-mono">
                                Code: {course.courseCode}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Batch:</span>
                              <span className="ml-2 font-medium">Batch {batch.batchNo}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Room:</span>
                              <span className="ml-2 font-medium">{batch.roomNo}</span>
                            </div>
                          </div>

                          <Link
                            to={`/staff/attendance/${course.courseId}/${batch.batchId}`}
                            className="block w-full"
                          >
                            <Button className="w-full">
                              Mark Attendance
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : [
                    <Card key={course.courseId} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {course.courseName}
                              </h3>
                              <p className="text-sm text-gray-500 font-mono">
                                Code: {course.courseCode}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Batch:</span>
                              <span className="ml-2 font-medium">No Batches</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Room:</span>
                              <span className="ml-2 font-medium">{course.roomNo}</span>
                            </div>
                          </div>

                          <Button className="w-full" disabled>
                            No Batches Available
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ]
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
