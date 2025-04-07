import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { getFirebaseToken } from "../utils/firebase";
import { postApi } from "../utils/api";
// import { toast } from "react-toastify";

const Login = () => {
  const [isLogin, setisLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  const handleGetFirebaseToken = async () => {
    try {
      const firebaseToken = await getFirebaseToken();
      if (firebaseToken) {
        console.log("Firebase token", firebaseToken);
      } else {
        console.error("Failed to get Firebase token");
      }
    } catch (err) {
      console.error("error getting Firebase token", err);
    }
  };

  const handleSignup = async () => {
    try {
      const res = await postApi("/signup", {
        firstName,
        lastName,
        emailId,
        password,
      });
      dispatch(addUser(res.data));
      // console.log(res.data);
      navigate("/");
      toast.success("Signup successfully !!");
      if (Notification.permission === "granted") {
        handleGetFirebaseToken();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await postApi("/login", { emailId, password });
      console.log(res.data);
      dispatch(addUser(res.data));
      navigate("/");
      toast.success("Login successfully !!");
      if (Notification.permission === "granted") {
        handleGetFirebaseToken();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="card bg-base-200 w-96 shadow-xl gap-4 p-10">
        <p className="text-center text-xl">{isLogin ? "Login" : "Signup"}</p>
        {!isLogin && (
          <>
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="FirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="LastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
          </>
        )}
        <label className="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>
          <input
            type="text"
            className="grow"
            placeholder="Email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="password"
            className="grow"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          className="btn bg-primary glass text-base-300"
          onClick={isLogin ? handleLogin : handleSignup}
        >
          {isLogin ? "Login" : "Signup"}
        </button>
        <p>
          {isLogin ? "dont have an account ? " : "have an account ? "}
          <button className="" onClick={() => setisLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
