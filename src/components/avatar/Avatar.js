import React from 'react'
import userImg from '../../assets/profile.png';
import './Avatar.scss';

const Avatar = ({src }) => {
  return (
    <div className='avatar'>
        <img src={src  ? src  : userImg} alt="User Avatar" />
    </div>
  )
}

export default Avatar