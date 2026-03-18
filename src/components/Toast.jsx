import React from 'react'
import { useApp } from '../context/AppContext'

export const Toast = () => {
  const { toast } = useApp()
  return (
    <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
      {toast.msg}
    </div>
  )
}

export default Toast
