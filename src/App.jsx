import React, { useState, useEffect } from "react";
import axios from "axios";
import qs from "qs"; // Import qs for URL encoding

const RealEstateForm = () => {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    location: "",
    bhk: "",
    bath: "", // Updated key to match backend
    sqft: "", // Updated key to match backend
  });
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/get-location-names");
        setLocations(response.data.locations || []);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError("Failed to load locations. Please try again.");
      }
    };
    fetchLocations();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEstimatedPrice(null);

    const { location, bhk, bath, sqft } = formData;

    if (!location || !bhk || !bath || !sqft) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/get-estimated-price",
        qs.stringify({
          location,
          bhk: Number(bhk),
          bath: Number(bath), // Updated key to match backend
          sqft: Number(sqft), // Updated key to match backend
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      setEstimatedPrice(response.data.estimated_price*1e5);
    } catch (err) {
      console.error("Error fetching price:", err);
      setError("Failed to fetch estimated price. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Real Estate Price Predictor</h2>
      <form onSubmit={handleSubmit}>
        {/* Location */}
        <div style={{ marginBottom: "15px" }}>
          <label>Location:</label>
          <select name="location" value={formData.location} onChange={handleChange} required>
            <option value="">Select Location</option>
            {locations.map((loc, index) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* BHK */}
        <div style={{ marginBottom: "15px" }}>
          <label>BHK:</label>
          <input
            type="number"
            name="bhk"
            value={formData.bhk}
            onChange={handleChange}
            min="1"
            max="10"
            required
          />
        </div>

        {/* Bathrooms */}
        <div style={{ marginBottom: "15px" }}>
          <label>Bathrooms:</label>
          <input
            type="number"
            name="bath" // Updated key to match backend
            value={formData.bath}
            onChange={handleChange}
            min="1"
            max="5"
            required
          />
        </div>

        {/* Total Sqft */}
        <div style={{ marginBottom: "15px" }}>
          <label>Total Sqft:</label>
          <input
            type="number"
            name="sqft" // Updated key to match backend
            value={formData.sqft}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} style={{ padding: "10px 20px", cursor: "pointer" }}>
          {loading ? "Predicting..." : "Get Estimated Price"}
        </button>
      </form>

      {/* Result Section */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {estimatedPrice && <h3>Estimated Price: ₹{estimatedPrice}</h3>}
    </div>
  );
};

export default RealEstateForm;
