import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import "./VehicleQuoteForm.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Define the types for the form data and errors
interface FormData {
  registrationNumber: string;
  postcode: string;
  phoneNumber: string;
  problem: string;
  carPhoto: File | null; // Can be null or a File
}

interface FormErrors {
  registrationNumber?: string;
  postcode?: string;
  phoneNumber?: string;
  problem?: string;
}

const VehicleQuoteEditForm: React.FC = () => {

  const { uniqueId } = useParams<{ uniqueId: string }>(); // Extract the unique ID from the URL
  const navigate = useNavigate();

//   const [formData, setFormData] = useState(null); // State to hold form data

  const [formData, setFormData] = useState <FormData> ({
    registrationNumber: "",
    postcode: "",
    phoneNumber: "",
    problem: "",
    carPhoto: null
  });

  const [isSuccess, setIsSuccess] = useState(false); 
  const [isFailure, setIsFailure] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://scrape4you-backend.onrender.com';

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`${API_URL}/car/get-data/${uniqueId}`);
        const data = await response.json();

        if (data) {
          setFormData({
            registrationNumber: data.registrationNumber,
            postcode: data.postcode,
            phoneNumber: data.phoneNumber,
            problem: data.problem,
            carPhoto: null, // Leave file upload empty for now
          });
        } else {
          setIsFailure(true);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        setIsFailure(true);
      }
    };

    if (uniqueId) {
      fetchFormData();
    }
  }, [uniqueId]);


  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phoneNumber: value });
    setErrors({ ...errors, phoneNumber: "" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, carPhoto: e.target.files[0] });
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error for this field
  };

  const validateForm = () =>{
    const newErrors : FormErrors = {};
    
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required.";
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = "Postcode is required.";
    } 

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    }

    return newErrors;
  }

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/car/edit-form/${uniqueId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            carPhoto: undefined, // Don't send carPhoto directly in JSON; handle it separately
          }),
        });
  
        const data = await response.json();
        if (data.success) {
            setIsSuccess(true);
        } else {
            setIsFailure(true);
        }
      } catch (error) {
        console.error("Error updating form:", error);
        setIsFailure(true);
      } finally {
        setLoading(false);
      }
    
  };

  const handleDelete = async () => {

    // Ask for user confirmation
    const userConfirmed = window.confirm(
        "Are you sure you want to delete this posting? This action cannot be undone."
    );

    if (!userConfirmed) {
        return; // Exit the function if the user cancels
    }

    try {
      const response = await fetch(`${API_URL}/car/delete-data/${uniqueId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setIsDeleted(true);
        
      } else {
        alert("Failed to delete the form.");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };


  const closeSuccessModal = () => {
    navigate("/")

  };

  const backToHomePage = () => {
    navigate("/")
  };

  return (
    <>
    <div className={`form-container ${isSuccess || isFailure ? "blur-background" : ""}`}>
      <h2>Get Paid More - Enter your reg and get an Offer that beats Scrap Value!</h2>
      <form onSubmit={handleUpdateForm}>
        <div className="form-group">
          <label className="form-label">Vehicle Registration</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            placeholder="Vehicle Registration Number.."
          />
          {errors.registrationNumber && (
          <div className="error-message">{errors.registrationNumber}</div>
        )}
        </div>

        <div className="form-group">
          <label className="form-label">Post Code</label>
          <input
            type="text"
            name="postcode"
            value={formData.postcode}
            onChange={handleInputChange}
            placeholder="Post Code.."
          />
          {errors.postcode && <div className="error-message">{errors.postcode}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle issues (Clutch gone, Engine Light on, MOT failed, etc.)</label>
          <input
            type="text"
            name="problem"
            value={formData.problem}
            onChange={handleInputChange}
            placeholder="Place your issues here.."
          />
        </div>

        <div className="form-group">
        <label htmlFor="phone-number" className="form-label">Phone Number</label> 
          <div className="phone-number-field">
            <PhoneInput
            country="gb" // Default country code (UK)
            // onChange={handleChange}
            inputClass="phone-input"
            buttonClass="phone-dropdown"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            
          />
          {errors.phoneNumber && (
          <div className="error-message">{errors.phoneNumber}</div> )}

         </div>
            
        </div>

        {/* Photo Upload Feature */}
    <div className="form-group">
      <label htmlFor="car-photo" className="form-label">Upload Car Image (optional)</label>
      <input
        type="file"
        id="car-photo"
        name="carPhoto"
        accept="image/*"
        onChange={handleFileChange}
      />
      
    </div>

        <div className="form-group">
          <small>* No hidden charges for removal, paperwork or other fees</small>
        </div>
        

<div className="button-container">
  <button type="submit" disabled={loading} className="submit-button">
    {loading ? (
      <>
        <span className="spinner"></span> Updating..
      </>
    ) : (
      "Update Details"
    )}
  </button>

  <button type="button" className="delete-button" 
  onClick={(e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    handleDelete();
  }}
  >
    Delete Posting
  </button>
</div>


      </form>

      <p className="footer-text">
        Download our app today to access a nationwide selection of vehicles and
        become a trusted agent in our network. Join us and unlock exciting
        opportunities!
      </p>
      <div className="app-buttons">
        <a href="www.apple.com">
        <img src="/apple_store.png" alt="App Store" />
        </a>

        <a href="www.google.com">
        <img src="/google_store.png" alt="Google Play" />
        </a>
      </div>
    </div>

    {/* Success Modal */}
    {isSuccess && (
        <div className="success-modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeSuccessModal}>
              &times;
            </span>
            <div className="icon-container">
              <img src="/edit.png" alt="Success Icon" className="success-icon" />
            </div>
            <h1>Quote Edited Successfully!</h1>
            
            {/* Back to Home Page Button */}
            <div className="back-home-btn-container">
              <button className="back-home-button" onClick={backToHomePage}>
                Back to Home Page
              </button>
            </div>


          </div>
        </div>
      )}

      {/* Delete Modal */}
    {isDeleted && (
        <div className="success-modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeSuccessModal}>
              &times;
            </span>
            <div className="icon-container">
              <img src="/delete.png" alt="Failure Icon" className="success-icon" />
            </div>
            <h1>Deleted Successfully!</h1>
            {/* Back to Home Page Button */}
            <div className="back-home-btn-container">
              <button className="back-home-button" onClick={backToHomePage}>
                Back to Home Page
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Failure Modal */}
    {isFailure && (
        <div className="success-modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeSuccessModal}>
              &times;
            </span>
            <div className="icon-container">
              <img src="/failure.png" alt="Failure Icon" className="success-icon" />
            </div>
            <h1>Error in Submission!</h1>
            <p>We could not submit your request.</p>
            <small>
              Please check all the inputs, including your vehicle registration number
              and phone number are correct and try again.
            </small>
            {/* Back to Home Page Button */}
            <div className="back-home-btn-container">
              <button className="back-home-button" onClick={backToHomePage}>
                Back to Home Page
              </button>
            </div>

          </div>
        </div>
      )}

    </>

  );
};

export default VehicleQuoteEditForm;
