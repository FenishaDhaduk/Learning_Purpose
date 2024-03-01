import React, { useState ,useEffect} from 'react'
import { onMessageListener, requestPermission } from './firebase'
import toast, { Toaster } from 'react-hot-toast'

function Notification() {
    const [notification,setNotification]  = useState({title:"",body:""})

    useEffect(() => {
        requestPermission()

        const unsubscribe = onMessageListener().then(payload=>{
            setNotification({
                title:payload.notification.title,
                body:payload.notification.body
            })
            toast.success(`${payload?.notification?.title}:${payload?.notification?.body}`,{
                duration:60000, // Display notification 1 minite
                position: "top-right",
                autoClose: 2000, // Close notification after 5 sec
            })
        })
        return()=>{
            unsubscribe.catch(err=> console.log("failed:",err))
        }
    
    }, [])
    console.log("notification",notification)
  return (
    <div>
      <Toaster/>
    <h1>{notification?.title}</h1>  
    <p>{notification?.body}</p>
    </div>
  )
}

export default Notification
