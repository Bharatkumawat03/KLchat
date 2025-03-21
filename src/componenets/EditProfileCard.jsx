import axios from 'axios';
import React, { useState } from 'react'
import { BASE_URL } from '../utils/constants';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { toast } from 'react-toastify';

const EditProfileCard = ({user}) => {
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [about, setAbout] = useState(user?.about || "");
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
    const dispatch = useDispatch();

    const handleEdit = async () => {
        try {
            const res = await axios.patch(`${BASE_URL}/profile/edit`,{firstName,lastName,about,photoUrl}, {withCredentials: true});
            // console.log(res.data.data);
            dispatch(addUser(res.data.data));
            toast.success("Profile updated successfully !!");
            
        } catch (error) {
            console.log(error);
            toast.error(error.response.data);
        }
    }

  return (
    <div className="card bg-base-200 w-full max-w-sm shrink-0 shadow-2xl mb-10 mx-auto">
      <div className="card-body ">
        <fieldset className="fieldset flex flex-col gap-2 ">
          <label className="fieldset-label">FirstName</label>
          <input type="text" className="input" placeholder="FirstName" value={firstName} onChange={(e)=> setFirstName(e.target.value)}/>
          <label className="fieldset-label">LastName</label>
          <input type="text" className="input" placeholder="LastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <label className="fieldset-label">about</label>
          <input type="text" className="input" placeholder="about" value={about} onChange={(e) => setAbout(e.target.value)} />
          <label className="fieldset-label">photoUrl</label>
          <input type="text" className="input" placeholder="photoUrl" value={photoUrl} onChange={(e)=> setPhotoUrl(e.target.value)} />
          <button onClick={() => handleEdit()} className="btn btn-neutral mt-4">Save</button>
        </fieldset>
      </div>
    </div>
  )
}

export default EditProfileCard