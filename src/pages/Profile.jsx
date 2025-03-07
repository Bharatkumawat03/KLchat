import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import ProfileCard from '../componenets/ProfileCard';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import EditProfileCard from '../componenets/EditProfileCard';

const Profile = () => {
    const user = useSelector((store) => store.user);
  return (
    <div className=' gap-8 flex flex-col justify-center'>
        <ProfileCard user={user} />
        <div className=''>
        <EditProfileCard user={user} />
            
        </div> 

    </div>
  )
}

export default Profile