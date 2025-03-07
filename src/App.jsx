import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom"
import Body from "./pages/Body"
import Login from "./pages/Login"
import Home from "./pages/Home"
import { ToastContainer } from "react-toastify"
import Connections from "./pages/Connections"
import Requests from "./pages/Requests"
import Profile from "./pages/Profile"
import Chat from "./componenets/Chat"

function App() {
  return (
    <>
    <BrowserRouter basename="/">
    <ToastContainer />
      <Routes>
        <Route path="/" element={<Body/>} >
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat/:targetUserId/:targetUserName" element={<Chat />} />
        </Route>

      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
