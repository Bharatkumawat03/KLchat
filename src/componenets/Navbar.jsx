import React, { useState } from "react";
import { isCookie, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../utils/userSlice";
import { toast } from "react-toastify";
import { logoutApi, saveFcmToken } from "../utils/api";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

    const handleLogout = async () => {
        try {
          const ress = await saveFcmToken({ fcmToken: "" });
          console.log('fcmToken removed', ress.data);
            const res = await logoutApi();
            // console.log(res);
            localStorage.clear();
            dispatch(removeUser());
            document.cookie.replace();
            navigate("/login");
            toast.success("Logout successfully !!");
        } catch (error) {
            console.log(error);
            toast.error(error.response.data);
        }
    }

  return (
    <div className=" ">
      <div className="navbar md:px-10 bg-base-300">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">KLchat</Link>
        </div>
        { user && <div className="flex-none gap-2">
          {/* <div className="form-control">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-24 md:w-auto"
            />
          </div> */}
          <p>Welcome, {user.firstName}</p>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src={user.photoUrl}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/connections">Connections</Link>
              </li>
              <li>
                <Link to="/requests">Requests</Link>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default Navbar;
