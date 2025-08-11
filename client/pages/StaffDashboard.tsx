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
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "staff") {
      navigate("/");
      return;
    }

    const fetchCourses = async () => {
      try {
        // Fetch courses with batches from API
        const response = await fetch('http://localhost:8080/courses/with-batches');
        if (response.ok) {
          const coursesData: ApiCourse[] = await response.json();
          console.log("Courses fetched from API:", coursesData);
          setCourses(coursesData);
          setFilteredCourses(coursesData);
        } else {
          console.error('Failed to fetch courses');
          // Fallback to empty array
          setCourses([]);
          setFilteredCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to empty array
        setCourses([]);
        setFilteredCourses([]);
      }
    };

    fetchCourses();
    setStaffName("Dr. Sheron"); // In real app, get from user data
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
                          Course Type
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
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {course.courseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {course.courseCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge
                              variant={
                                course.courseType === "Elective"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {course.courseType}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.section}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link to={`/staff/attendance/${course.id}`}>
                              <Button size="sm">Mark Attendance</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
