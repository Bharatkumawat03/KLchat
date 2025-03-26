import React from 'react'

const ProfileCard = ({user}) => {
  return (
    <div className="p-10 bg-base-300 md:mx-[15%] md:mt-10 md:rounded-2xl">
        <div className="hero-content text-center gap-10">
            <img className='rounded-full w-28 h-28 object-cover' src={user?.photoUrl} alt="" />
            <div className="max-w-md">
            <h1 className="text-4xl font-bold">{user?.firstName + " " + user?.lastName}</h1>
            <p className="py-6">
                {user?.about}
            </p>
            </div>
        </div>
    </div>
  )
}

export default ProfileCard