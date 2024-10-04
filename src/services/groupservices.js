const url = process.env.REACT_APP_API_ENDPOINT

export const dopostgroup =async (payload)=>{
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${url}/group/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        return response.json()
        
    } catch (error) {
      console.log("🚀 ~ dopostgroup ~ error:", error)
        
    }
}