import OtpInput from "react-otp-input";
import { useState } from "react";
import "./App.css"

export default function Libraryotp() {
  const [code, setCode] = useState("");

  const handleChange = (code) => setCode(code);

  return (
    <div className="libraryotp">
      <OtpInput
        value={code}
        onChange={handleChange} 
        numInputs={6}
        separator={<span style={{ width: "8px" }}></span>}
        isInputNum={true}
        shouldAutoFocus={true}
        renderInput={(props) => <input {...props} />}
        inputStyle={{
          border: "1px solid transparent",
          borderRadius: "8px",
          width: "54px",
          height: "54px",
          fontSize: "12px",
          color: "#000",
          fontWeight: "400",
          caretColor: "blue"
        }}
        focusStyle={{
          border: "1px solid #CFD3DB",
          outline: "none"
        }}
      />
    </div>
  );
}
