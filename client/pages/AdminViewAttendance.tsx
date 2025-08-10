import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, getAttendanceRecords, getCurrentDate, type AttendanceRecord } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface AttendanceEntry {
  studentId: number;
  studentRollNo: string;
  studentName: string;
  status: 'Present' | 'OD' | 'Leave';
  section: string;
  courseName: string;
}

type SortOrder = 'asc' | 'desc';
type SortField = 'rollNo' | 'section' | 'status' | 'course';

export default function AdminViewAttendance() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('rollNo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);

  const itemsPerPage = 10;

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Filter attendance records based on selected date and period
    const records = getAttendanceRecords();
    const period = parseInt(selectedPeriod);
    
    const filteredRecords = records.filter(record => 
      record.date === selectedDate && 
      period >= record.periodFrom && 
      period <= record.periodTo
    );

    // Flatten entries from all matching records
    const entries: AttendanceEntry[] = [];
    filteredRecords.forEach(record => {
      record.entries.forEach(entry => {
        entries.push({
          ...entry,
          section: '1', // Mock section data - in real app this would come from student data
          courseName: record.courseName
        });
      });
    });

    // Add mock data if no records found to show the UI
    if (entries.length === 0) {
      const mockEntries: AttendanceEntry[] = [
        { studentId: 1001, studentRollNo: 'CSE101', studentName: 'John Doe', status: 'Present', section: '1', courseName: 'Computer Science' },
        { studentId: 1002, studentRollNo: 'CSE102', studentName: 'Jane Smith', status: 'OD', section: '1', courseName: 'Computer Science' },
        { studentId: 1003, studentRollNo: 'CSE103', studentName: 'Bob Johnson', status: 'Leave', section: '2', courseName: 'Mathematics' },
        { studentId: 1004, studentRollNo: 'CSE104', studentName: 'Alice Brown', status: 'Present', section: '2', courseName: 'Mathematics' },
        { studentId: 1005, studentRollNo: 'CSE105', studentName: 'Charlie Wilson', status: 'OD', section: '1', courseName: 'Computer Science' },
        { studentId: 1006, studentRollNo: 'CSE106', studentName: 'Diana Davis', status: 'Present', section: '3', courseName: 'Physics' },
        { studentId: 1007, studentRollNo: 'CSE107', studentName: 'Eve Miller', status: 'Leave', section: '3', courseName: 'Physics' },
        { studentId: 1008, studentRollNo: 'CSE108', studentName: 'Frank Garcia', status: 'Present', section: '2', courseName: 'Mathematics' },
        { studentId: 1009, studentRollNo: 'CSE109', studentName: 'Grace Martinez', status: 'OD', section: '1', courseName: 'Computer Science' },
        { studentId: 1010, studentRollNo: 'CSE110', studentName: 'Henry Lee', status: 'Present', section: '3', courseName: 'Physics' },
      ];
      setAttendanceEntries(mockEntries);
    } else {
      // Deduplicate entries by studentId to prevent duplicate keys
      const uniqueEntries = entries.filter((entry, index, arr) =>
        arr.findIndex(e => e.studentId === entry.studentId) === index
      );
      setAttendanceEntries(uniqueEntries);
    }
    
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedDate, selectedPeriod]);

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = attendanceEntries;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry =>
        entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by roll number
    filtered.sort((a, b) => {
      const comparison = a.studentRollNo.localeCompare(b.studentRollNo);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [attendanceEntries, searchQuery, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = filteredAndSortedEntries.slice(startIndex, endIndex);

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case 'OD':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">OD</Badge>;
      case 'Leave':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Leave</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVisiblePages = () => {
    const maxVisible = 3;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link 
              to="/admin" 
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
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">View Attendance</h1>
            <p className="text-gray-600 mt-1">Review attendance records by date and period</p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Period {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Attendance Records</CardTitle>
                <p className="text-sm text-gray-600">
                  Showing {currentEntries.length} of {filteredAndSortedEntries.length} records
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {currentEntries.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    No attendance records found for the selected date and period.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <button
                            onClick={handleSortToggle}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                          >
                            Roll No
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentEntries.map((entry) => (
                        <tr key={entry.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {entry.studentRollNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.section}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(entry.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.courseName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {getVisiblePages().map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Page {currentPage} of {totalPages}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
