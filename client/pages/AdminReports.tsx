import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, getCurrentDate } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, BarChart3, Download, FileText, Table, TrendingUp } from 'lucide-react';

interface ReportData {
  id: number;
  rollNo: string;
  studentName: string;
  section: string;
  presentDays: number;
  totalDays: number;
  odDays: number;
  leaveDays: number;
  percentage: number;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [selectedSection, setSelectedSection] = useState('all');
  const [reportType, setReportType] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

  const mockReportData: ReportData[] = [
    { id: 1, rollNo: 'CSE101', studentName: 'John Doe', section: 'A', presentDays: 18, totalDays: 20, odDays: 1, leaveDays: 1, percentage: 90 },
    { id: 2, rollNo: 'CSE102', studentName: 'Jane Smith', section: 'A', presentDays: 19, totalDays: 20, odDays: 1, leaveDays: 0, percentage: 95 },
    { id: 3, rollNo: 'CSE103', studentName: 'Bob Johnson', section: 'B', presentDays: 16, totalDays: 20, odDays: 2, leaveDays: 2, percentage: 80 },
    { id: 4, rollNo: 'CSE104', studentName: 'Alice Brown', section: 'B', presentDays: 20, totalDays: 20, odDays: 0, leaveDays: 0, percentage: 100 },
    { id: 5, rollNo: 'CSE105', studentName: 'Charlie Wilson', section: 'C', presentDays: 17, totalDays: 20, odDays: 2, leaveDays: 1, percentage: 85 },
    { id: 6, rollNo: 'CSE106', studentName: 'Diana Davis', section: 'C', presentDays: 15, totalDays: 20, odDays: 1, leaveDays: 4, percentage: 75 },
  ];

  const handleGenerateReport = () => {
    // Filter data based on selected section
    let filteredData = mockReportData;
    if (selectedSection) {
      filteredData = mockReportData.filter(item => item.section === selectedSection);
    }
    
    setReportData(filteredData);
    setShowReport(true);
  };

  const handleExport = (format: string) => {
    // Mock export functionality
    alert(`Exporting report as ${format}... (Mock functionality)`);
  };

  const getAttendanceChartData = () => {
    if (!reportData.length) return null;
    
    const sections = [...new Set(reportData.map(item => item.section))];
    return sections.map(section => {
      const sectionData = reportData.filter(item => item.section === section);
      const avgPercentage = sectionData.reduce((sum, item) => sum + item.percentage, 0) / sectionData.length;
      return { section, percentage: Math.round(avgPercentage) };
    });
  };

  const getStatusData = () => {
    if (!reportData.length) return null;
    
    const totalPresent = reportData.reduce((sum, item) => sum + item.presentDays, 0);
    const totalOD = reportData.reduce((sum, item) => sum + item.odDays, 0);
    const totalLeave = reportData.reduce((sum, item) => sum + item.leaveDays, 0);
    const total = totalPresent + totalOD + totalLeave;
    
    return [
      { label: 'Present', value: totalPresent, percentage: Math.round((totalPresent / total) * 100), color: 'bg-green-500' },
      { label: 'OD', value: totalOD, percentage: Math.round((totalOD / total) * 100), color: 'bg-blue-500' },
      { label: 'Leave', value: totalLeave, percentage: Math.round((totalLeave / total) * 100), color: 'bg-red-500' },
    ];
  };

  const getReportColumns = () => {
    switch (reportType) {
      case 'attendance-summary':
        return ['Roll No', 'Student Name', 'Section', 'Present Days', 'Total Days', 'Percentage'];
      case 'od-report':
        return ['Roll No', 'Student Name', 'Section', 'OD Days', 'Total Days'];
      case 'absentee-list':
        return ['Roll No', 'Student Name', 'Section', 'Leave Days', 'Percentage'];
      default:
        return ['Roll No', 'Student Name', 'Section', 'Present Days', 'Total Days', 'Percentage'];
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'attendance-summary':
        return 'Attendance Summary Report';
      case 'od-report':
        return 'Official Duty (OD) Report';
      case 'absentee-list':
        return 'Absentee List Report';
      default:
        return 'Attendance Report';
    }
  };

  const chartData = getAttendanceChartData();
  const statusData = getStatusData();

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
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate attendance and academic reports</p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Filters</CardTitle>
              <CardDescription>Select parameters to generate your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance-summary">Attendance Summary</SelectItem>
                      <SelectItem value="od-report">OD Report</SelectItem>
                      <SelectItem value="absentee-list">Absentee List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={!reportType}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Generate Report
                </Button>
                
                {showReport && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExport('PDF')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('Excel')}>
                        <Table className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('CSV')}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report Results */}
          {showReport && (
            <div className="space-y-6">
              {/* Report Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{reportData.length}</p>
                      <p className="text-sm text-gray-600">Total Students</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(reportData.reduce((sum, item) => sum + item.percentage, 0) / reportData.length)}%
                      </p>
                      <p className="text-sm text-gray-600">Average Attendance</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">Date Range</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section-wise Attendance Chart */}
                {chartData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Section-wise Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {chartData.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Section {item.section}</span>
                              <span className="font-medium">{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status Distribution Chart */}
                {statusData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Attendance Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statusData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded ${item.color}`} />
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold">{item.value}</span>
                              <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Report Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{getReportTitle()}</CardTitle>
                  <CardDescription>
                    Detailed {reportType?.replace('-', ' ')} data for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {getReportColumns().map((column, index) => (
                            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {item.rollNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.studentName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.section}
                            </td>
                            {reportType === 'attendance-summary' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.presentDays}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.totalDays}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <Badge variant={item.percentage >= 75 ? 'default' : 'destructive'}>
                                    {item.percentage}%
                                  </Badge>
                                </td>
                              </>
                            )}
                            {reportType === 'od-report' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.odDays}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.totalDays}
                                </td>
                              </>
                            )}
                            {reportType === 'absentee-list' && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.leaveDays}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <Badge variant={item.percentage >= 75 ? 'default' : 'destructive'}>
                                    {item.percentage}%
                                  </Badge>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!showReport && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Your First Report</h3>
                  <p className="text-gray-600 mb-4">
                    Select your filters above and click "Generate Report" to view attendance data, charts, and analytics.
                  </p>
                  <p className="text-sm text-gray-500">
                    You can export reports in PDF, Excel, or CSV format once generated.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
