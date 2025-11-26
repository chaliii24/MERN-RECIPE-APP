
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddRecipe from "./pages/AddRecipe";
import RecipeDetail from "./pages/RecipeDetail";
import EditRecipe from "./pages/EditRecipe";
import Footer from "./components/Footer";
import Manage from "./pages/Manage";
import AboutUs from "./pages/AboutUs";
import Explore from "./pages/Explore";
import Favorites from "./pages/Favorites";
import AdminPanel from "./pages/AdminPanel";
import EditUser from "./pages/EditUser";
import AdminRoute from "./components/admin/AdminRoute";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-recipe" element={<AddRecipe />} />
            <Route path="/edit-recipe/:id" element={<EditRecipe />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/favorites" element={<Favorites />} />
              <Route path="/adminpanel" element={<AdminPanel />} />
            
            {/* Admin routes wrapped in AdminRoute */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users/:id/edit"
              element={
                <AdminRoute>
                  <EditUser />
                </AdminRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </div>
      <Footer />
    </div>
  );
}

export default App;
