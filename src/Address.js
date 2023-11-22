import React,{useState,useEffect} from 'react'

export default function Address() {
    const [Address,setAddress] = useState("")

    useEffect(()=>{
        const getAddress = new Promise((resolve,reject)=>{
            setTimeout(()=>{
                resolve("101 Iskon Cross Road")
            },4000)
        });
        getAddress.then(result=>{
            setAddress(result)
        })
    },[])

    if(!Address){
        return <h2>Loading Address ..</h2>
    }
  return (
    <>
    <h1>Address Title</h1>
    <h3>{Address}</h3>
    </>
  )
}
