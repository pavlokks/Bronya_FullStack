import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import MobileNav from './layouts/MobileNav';
import Footer from './layouts/Footer';
import Home from './components/home/Home';
import Room from './components/filter/Room';
import Flat from './components/filter/Flat';
import Hotel from './components/filter/Hotel';
import Map from './components/map/Map';
import Saved from './components/profile/saved/Saved';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import ForgotPass from './components/auth/ForgotPass';
import { UserContextProvider, UserContext } from './context/UserContext';
import ProfilePage from './components/profile/ProfilePage';
import PlacesPage from './components/profile/myhosting/PlacesPage';
import BookingPage from './components/profile/mybooking/BookingPage';
import BookingsPage from './components/profile/mybooking/BookingsPage';
import PlacesFormPage from './components/profile/myhosting/PlacesFormPage';
import PlacePage from './components/profile/myhosting/PlacePage';
import DetailPage from './components/profile/DetailPage';
import Bookedhosting from './components/profile/bookedhosting/Bookedhosting';
import Error from './layouts/Error';
import Chatpage from './components/chats/chatpages/Chatpage';
import { useContext } from 'react';

import '../src/assets/styles/main.css';

const ProtectedRoute = ({ children }) => {
  const { islogin, loading } = useContext(UserContext);
  if (loading) return null;
  return islogin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <UserContextProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room" element={<Room />} />
          <Route path="/flat" element={<Flat />} />
          <Route path="/hotel" element={<Hotel />} />
          <Route path="/map" element={<Map />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPass />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/chats" element={<Chatpage />} />
          <Route path="*" element={<Error />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/places"
            element={
              <ProtectedRoute>
                <PlacesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/place/:id"
            element={
              <ProtectedRoute>
                <PlacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/places/new"
            element={
              <ProtectedRoute>
                <PlacesFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/places/:id"
            element={
              <ProtectedRoute>
                <PlacesFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/bookedhosting"
            element={
              <ProtectedRoute>
                <Bookedhosting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/saved"
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
        <MobileNav />
      </UserContextProvider>
    </BrowserRouter>
  );
}

export default App;
