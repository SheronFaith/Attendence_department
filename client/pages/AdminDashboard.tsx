import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUser, clearUser } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, Calendar, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

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
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, Super Admin</p>
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
          {/* Page Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
            <p className="text-gray-600 mt-1">
              Manage attendance records and view system reports.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* View Attendance */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">View Attendance</CardTitle>
                    <CardDescription>
                      Review attendance records by date and period
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This feature is being developed. Continue prompting to build it!
                </p>
              </CardContent>
            </Card>

            {/* Student Management */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Student Management</CardTitle>
                    <CardDescription>
                      Manage student records and enrollments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This feature is being developed. Continue prompting to build it!
                </p>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Reports</CardTitle>
                    <CardDescription>
                      Generate attendance and academic reports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This feature is being developed. Continue prompting to build it!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Quick statistics about the attendance system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <p className="text-sm text-gray-600">Active Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">4</p>
                  <p className="text-sm text-gray-600">Enrolled Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">1</p>
                  <p className="text-sm text-gray-600">Active Staff</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">-</p>
                  <p className="text-sm text-gray-600">Attendance Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Development Mode</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a placeholder admin dashboard. Continue prompting to build specific features 
                    like attendance viewing, student management, and reporting systems.
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Current features: Login system, Staff dashboard, Attendance marking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
