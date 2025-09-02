import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User, Building2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // setIsLoading(true);
    // // Simulate login delay
    // setTimeout(() => {
    //   setIsLoading(false);
    //   console.log('This is handle submit with data ',email,password)
    //   onLogin();
    // }, 1000);
    e.preventDefault();
    setIsLoading(true);
    try {
      const loginData = {
        username: username.trim(),
        password: password.trim(),
      };
      if (!loginData.username || !loginData.password) {
        // alert("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      // getting the env data of the api

      const baseURL = import.meta.env.VITE_API_URL;

    

      // Now putting the axios request
      const result = await axios.post(`${baseURL}/users/login`, loginData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("This is posted data of signin", result.data);
      console.log(result.data.user);
      const { user, token } = result.data;
      console.log(
        "This is the data of the login user sending to the localstorage",
        user,
        token
      );

      // Local Storage data sending
      localStorage.setItem("User", JSON.stringify(user));
      localStorage.setItem("Token", JSON.stringify(token));

      setIsLoading(false);
      // alert("Login Successfull");
      navigate("/dashboard");
    } catch (error) {
      console.log("This error in login", error);
      // alert("Not able to signin ");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JobFlow Admin
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Sign in to manage your clients and job profiles
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Demo credentials: admin@company.com / password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
