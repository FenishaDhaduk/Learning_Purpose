import React, { useState } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { dopostgroup } from "../services/groupservices.js";


export default function CreateGroupModal({ isOpen, toggle, onSave }) {
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [groupName,setGroupName] = useState()

  const  optionsuser = localStorage?.getItem("allusers")
  const user = JSON.parse(optionsuser)

  const options = user?.map((user) => ({
    value: user._id,
    label: user.username,
  }));
  

  const handleChange = (selectedOptions) => {
    const ids = selectedOptions.map(option => option.value);
    setSelectedOptionIds(ids);
  };

  const doCreateGroup = async ()=>{
    const payload = {
      name: groupName,
      members: selectedOptionIds,
    };
    try {
      const responce = await dopostgroup(payload)
      toggle()
      return responce
    } catch (error) {
      console.log("🚀 ~ doCreateGroup ~ error:", error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={toggle}
      contentLabel="Profile Image Options"
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Background color of the overlay
          display: "flex", // Use flexbox to center the modal
          alignItems: "center",
          justifyContent: "center",
        },
        content: {
          width: "500px", // Set the width of the modal
          height: "400px", // Set the height of the modal
          margin: "auto", // Center the modal within the overlay
          borderRadius: "8px", // Rounded corners
          padding: "20px", // Padding inside the modal
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Box shadow for depth
          position: "relative", // Required for react-modal
          inset: "auto", // Override default inset styles to center properly
          display: "flex", // Flexbox for vertical alignment
          flexDirection: "column", // Column layout
        },
      }}
    >
      {/* Title Section */}
      <h2 className="text-lg font-bold text-center mb-4">Create a Group</h2>

      {/* Content Section */}
      <div className="flex-grow">
        <div className="grid p-3">
          <label className="text-base font-normal mb-2">Enter a Group Name</label>
          <input
            type="text"
            placeholder="Group Name"
            className="border rounded p-2 w-full"
            value={groupName}
            onChange={(e)=>setGroupName(e.target.value)}
          />
        </div>
        <div className="grid p-3">
          <label className="text-base font-normal mb-2">Add Members</label>
        <div className="max-w-md mx-auto w-full">
      <Select
        isMulti
        options={options}
        onChange={handleChange}
        className="basic-multi-select w-full"
        classNamePrefix="select members"
      />

        </div>
        </div>
      </div>
      {/* Button Section */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="bg-gray-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={()=>doCreateGroup()}
        >
          Save
        </button>
        <button
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          onClick={toggle}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
