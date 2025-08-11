import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockStaff, mockAdmins, saveUser, type User } from "@/lib/mockData";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [role, setRole] = useState<"Staff" | "Admin" | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"staff" | "admin">("staff");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate fields
    if (!role || !username || !password) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      let user: User | null = null;

      if (role === "Staff") {
        const staff = mockStaff.find(
          (s) => s.username === username && s.password === password,
        );
        if (staff) {
          user = { role: "staff", id: staff.id };
        }
      } else if (role === "Admin") {
        const admin = mockAdmins.find(
          (a) => a.username === username && a.password === password,
        );
        if (admin) {
          user = { role: "admin", id: admin.id };
        }
      }

      if (user) {
        saveUser(user);
        if (user.role === "staff") {
          navigate("/staff");
        } else {
          navigate("/admin");
        }
      } else {
        setError(
          "Invalid credentials. Please check your username and password.",
        );
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              College Attendance System
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to manage attendance records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value: "Staff" | "Admin") => setRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription role="alert" aria-live="polite">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>Staff:</strong> staff1 / pass
                  </p>
                  <p>
                    <strong>Admin:</strong> admin / adminpass
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  onClick={() =>
                    alert("Demo system - password reset not available")
                  }
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
