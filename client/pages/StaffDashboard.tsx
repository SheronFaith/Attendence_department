import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockCourses, getUser, clearUser, type Course } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Search } from 'lucide-react';

export default function StaffDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [staffName, setStaffName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'staff') {
      navigate('/');
      return;
    }

    // TODO: Replace with axios GET /api/staff/courses
    // const response = await axios.get('/api/staff/courses', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // setCourses(response.data);
    
    const staffCourses = mockCourses.filter(course => course.staffId === user.id);
    setCourses(staffCourses);
    setFilteredCourses(staffCourses);
    setStaffName('Dr. Sheron'); // In real app, get from user data
  }, [navigate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Staff Dashboard</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Assigned Courses</h2>
            <p className="text-gray-600 mt-1">
              Select a course to mark attendance. Date will be auto-filled on the next screen.
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

          {/* Courses Grid/Table */}
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-500">
                    {searchQuery ? 'No courses found matching your search.' : 'No courses assigned.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {course.courseName}
                        </CardTitle>
                        <CardDescription className="font-mono text-sm">
                          {course.courseCode}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={course.courseType === 'Elective' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {course.courseType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Section:</span>
                        <span className="ml-1">{course.section}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Year:</span>
                        <span className="ml-1">{course.year}</span>
                      </div>
                    </div>
                    <Link to={`/staff/attendance/${course.id}`}>
                      <Button className="w-full" size="sm">
                        Mark Attendance
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
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
                              variant={course.courseType === 'Elective' ? 'default' : 'secondary'}
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
                              <Button size="sm">
                                Mark Attendance
                              </Button>
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
