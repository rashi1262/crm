import React, { Children } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
   
    const isAuthenticated=()=>{
        return localStorage.getItem('Token') !== null
    }

  return isAuthenticated() ? <Outlet/> : <Navigate to="/login" replace />
  
}

export default ProtectedRoute