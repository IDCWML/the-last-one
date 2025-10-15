"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../card";
import { Input } from "../../input";
import { Label } from "../../label";
import { Button } from "../../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../dialog";

interface User {
  name: string;
  kelas: string;
  age: number;
  email: string;
  ageCategory: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kelas, setKelas] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [showAccountSelection, setShowAccountSelection] = useState(false);
  const [matchingAccounts, setMatchingAccounts] = useState<User[]>([]);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [previousLogins, setPreviousLogins] = useState<User[]>([]);
  const [selectedLogin, setSelectedLogin] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getAgeCategory = (age: number) => {
    if (age >= 1 && age <= 6) return "children";
    if (age >= 7 && age <= 12) return "pre-teen";
    if (age >= 13 && age <= 17) return "teenager";
    if (age >= 18) return "adult";
    return "unknown";
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      router.push("/home");
    }

    // Load previous logins for dropdown
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    setPreviousLogins(users);

    // Auto-select last login if available
    const lastEmail = localStorage.getItem("lastLoginEmail");
    if (lastEmail && users.length > 0) {
      const lastUser = users.find((user) => user.email === lastEmail);
      if (lastUser) {
        handleLoginSelection(lastUser);
      }
    }
  }, [router]);

  const handleLoginSelection = (loginData: User) => {
    setName(loginData?.name || "");
    setEmail(loginData?.email || "");
    setKelas(loginData?.kelas || "");
    setAge(loginData?.age ? loginData.age.toString() : "");
    setSelectedLogin(loginData ? `${loginData.name || ""} - ${loginData.email || ""} - ${loginData.kelas || ""}` : "");
  };

  const handleLogin = () => {
    if (!name || !kelas || !password || !age || !email) {
      setErrorMessage("Semua field harus diisi!");
      setShowErrorModal(true);
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1) {
      setErrorMessage("Umur harus berupa angka positif!");
      setShowErrorModal(true);
      return;
    }

    const existingUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    // Cek apakah email sudah ada
    const emailExists = existingUsers.some((user) => user.email === email);
    if (emailExists) {
      // Jika email ada, cek apakah name sama
      const userWithEmail = existingUsers.find((user) => user.email === email);
      if (userWithEmail && userWithEmail.name === name) {
        // Login sebagai user yang sudah ada
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", name);
        localStorage.setItem("userClass", kelas);
        localStorage.setItem("userAge", ageNum.toString());
        localStorage.setItem("userAgeCategory", getAgeCategory(ageNum));
        router.push("/home");
        return;
      } else {
        // Email sama tapi name berbeda, cek apakah ada multiple accounts dengan email ini
        const accountsWithEmail = existingUsers.filter((user) => user.email === email);
        if (accountsWithEmail.length > 1) {
          // Multiple accounts, show selection
          setMatchingAccounts(accountsWithEmail);
          setShowAccountSelection(true);
          return;
        } else {
          // Single account, ask to create new
          setShowCreateNew(true);
          return;
        }
      }
    }

    // Cek apakah username sudah ada
    const userExists = existingUsers.some((user) => user.name === name);
    if (userExists) {
      setErrorMessage("Username sudah digunakan. Pilih username lain.");
      setShowErrorModal(true);
      return;
    }

    // Simpan user baru
    const newUser = {
      name,
      kelas,
      age: ageNum,
      email,
      ageCategory: getAgeCategory(ageNum),
    };
    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    // Set session
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", name);
    localStorage.setItem("userClass", kelas);
    localStorage.setItem("userAge", ageNum.toString());
    localStorage.setItem("userAgeCategory", getAgeCategory(ageNum));
    localStorage.setItem("lastLoginEmail", email);

    router.push("/home");
  };

  const selectAccount = (selectedUser: User) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", selectedUser.name);
    localStorage.setItem("userClass", selectedUser.kelas);
    localStorage.setItem("userAge", selectedUser.age.toString());
    localStorage.setItem("userAgeCategory", selectedUser.ageCategory);
    localStorage.setItem("lastLoginEmail", selectedUser.email);
    setShowAccountSelection(false);
    router.push("/home");
  };

  const createNewAccount = () => {
    const existingUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const ageNum = parseInt(age);

    // Simpan user baru dengan email yang sama
    const newUser = {
      name,
      kelas,
      age: ageNum,
      email,
      ageCategory: getAgeCategory(ageNum),
    };
    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    // Set session
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", name);
    localStorage.setItem("userClass", kelas);
    localStorage.setItem("userAge", ageNum.toString());
    localStorage.setItem("userAgeCategory", getAgeCategory(ageNum));

    setShowCreateNew(false);
    router.push("/home");
  };

  const isFormValid = name && kelas && password && age && email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas</Label>
            <Input
              id="kelas"
              type="text"
              placeholder="Kelas"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Age"
              min={1}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          {/* Dropdown for previous logins */}
          {previousLogins.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="previous-login">Previous Login (Optional)</Label>
              <select
                id="previous-login"
                value={selectedLogin}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue) {
                    const loginData = previousLogins.find(login => `${login.name} - ${login.email} - ${login.kelas}` === selectedValue);
                    if (loginData) {
                      handleLoginSelection(loginData);
                    }
                  } else {
                    setSelectedLogin("");
                  }
                }}
                className="w-full p-2 rounded border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Pilih login sebelumnya (opsional)</option>
                {previousLogins.map((login, index) => (
                  <option key={index} value={`${login.name} - ${login.email} - ${login.kelas}`}>
                    {login.name} - {login.email} - {login.kelas}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!isFormValid}
            className="w-full"
          >
            Login
          </Button>
        </CardContent>
      </Card>

      {/* Account Selection Modal */}
      <Dialog open={showAccountSelection} onOpenChange={setShowAccountSelection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Account</DialogTitle>
            <DialogDescription>
              Multiple accounts found with this email. Choose one:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {matchingAccounts.map((account, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => selectAccount(account)}
              >
                {account.name} - {account.kelas} - Age {account.age}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccountSelection(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Account Modal */}
      <Dialog open={showCreateNew} onOpenChange={setShowCreateNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account?</DialogTitle>
            <DialogDescription>
              An account with this email already exists but with a different name. Do you want to create a new account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateNew(false)}>
              Cancel
            </Button>
            <Button onClick={createNewAccount}>
              Yes, Create New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Error</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorModal(false)}>
              OK
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowErrorModal(false);
                // Reset form if username error
                if (errorMessage.includes("Username")) {
                  setName("");
                }
              }}
            >
              Buat Ulang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
