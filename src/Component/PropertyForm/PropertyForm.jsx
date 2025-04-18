import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaWifi, FaParking, FaSwimmingPool, FaHotTub, FaTv, FaUtensils, FaSnowflake, FaPaw, FaSmokingBan, FaFireExtinguisher, FaFirstAid, FaShower, FaCoffee, FaUmbrellaBeach, FaBath, FaWind, FaFan, FaCar, FaBicycle, FaBabyCarriage, FaKey, FaLock, FaBell, FaMapMarkerAlt, FaTree, FaMountain, FaCity } from "react-icons/fa";
import { propertiesListing, updateProperty, propertyListingRequest } from "../../../Api/api";
import Toast from "../Toast/Toast";
import "./PropertyForm.css";

// Define maximum dimensions for image resizing
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

// Utility function to resize images
const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Resize only if the image exceeds max dimensions
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    const resizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(resizedFile);
                },
                'image/jpeg',
                0.9
            );
        };
        img.onerror = (error) => reject(error);

        const reader = new FileReader();
        reader.onload = (e) => (img.src = e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const PropertyForm = ({ initialData, onSubmit, onClose }) => {
    const predefinedFacilities = [
        { name: "Wi-Fi", icon: <FaWifi /> },
        { name: "Parking", icon: <FaParking /> },
        { name: "Swimming Pool", icon: <FaSwimmingPool /> },
        { name: "Hot Tub", icon: <FaHotTub /> },
        { name: "TV", icon: <FaTv /> },
        { name: "Kitchen", icon: <FaUtensils /> },
        { name: "Air Conditioning", icon: <FaSnowflake /> },
        { name: "Pets Allowed", icon: <FaPaw /> },
        { name: "No Smoking", icon: <FaSmokingBan /> },
        { name: "Fire Extinguisher", icon: <FaFireExtinguisher /> },
        { name: "First Aid Kit", icon: <FaFirstAid /> },
        { name: "Shower", icon: <FaShower /> },
        { name: "Coffee Maker", icon: <FaCoffee /> },
        { name: "Beach Access", icon: <FaUmbrellaBeach /> },
        { name: "Bathtub", icon: <FaBath /> },
        { name: "Heating", icon: <FaWind /> },
        { name: "Ceiling Fan", icon: <FaFan /> },
        { name: "Free Parking", icon: <FaCar /> },
        { name: "Bicycle Rental", icon: <FaBicycle /> },
        { name: "Baby Crib", icon: <FaBabyCarriage /> },
        { name: "Keyless Entry", icon: <FaKey /> },
        { name: "Safe", icon: <FaLock /> },
        { name: "Security Alarm", icon: <FaBell /> },
        { name: "Nearby Attractions", icon: <FaMapMarkerAlt /> },
        { name: "Garden", icon: <FaTree /> },
        { name: "Mountain View", icon: <FaMountain /> },
        { name: "City View", icon: <FaCity /> }
    ];

    const clusters = [
        "Kuching", 
        "Miri", 
        "Sibu", 
        "Bintulu",
        "Limbang",
        "Sarikei",
        "Sri Aman",
        "Kapit",
        "Mukah",
        "Betong",
        "Samarahan",
        "Serian",
        "Lundu",
        "Lawas",
        "Marudi",
        "Simunjan",
        "Tatau",
        "Belaga",
        "Debak",
        "Kabong",
        "Pusa",
        "Sebuyau",
        "Saratok",
        "Selangau",
        "Tebedu"
    ];

    const categories = [
        "Resort",
        "Hotel",
        "Inn",
        "Guesthouse",
        "Villa",
        "Apartment",
        "Cabin",
        "Farm Stay",
        "Cottage",
        "Hostel"
    ];

    const [formData, setFormData] = useState({
        username: "",
        propertyPrice: "1",
        propertyAddress: "",
        nearbyLocation: "",
        propertyBedType: "1",
        propertyGuestPaxNo: "1",
        propertyDescription: "",
        facilities: [],
        propertyImage: [],
        clusterName: "",
        categoryName: "",
    });

    const [removedImages, setRemovedImages] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");
    const [selectedFacilities, setSelectedFacilities] = useState([]);
    const fileInputRef = useRef(null);
    const locationInputRef = useRef(null);

    useEffect(() => {
        if (initialData?.facilities) {
          const selected = initialData.facilities.split(',').map(f => f.trim());
          setSelectedFacilities(selected);
        }
    }, [initialData]);
      

    useEffect(() => {  
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setFormData((prev) => ({ ...prev, username: storedUsername }));
        }
    
        if (initialData) {
            let facilitiesArray = [];
            
            if (initialData.facilities) {
                if (typeof initialData.facilities === 'string') {
                    // Handle empty string case
                    facilitiesArray = initialData.facilities.trim() 
                        ? initialData.facilities.split(",").map(facility => facility.trim())
                        : [];
                } else if (Array.isArray(initialData.facilities)) {
                    facilitiesArray = initialData.facilities;
                }
            }
            
            console.log("Parsed facilities array:", facilitiesArray);
    
            setFormData({
                username: initialData.username || "",
                propertyPrice: initialData.rateamount || "",
                propertyAddress: initialData.propertyaddress || "",
                nearbyLocation: initialData.nearbylocation || "",
                propertyBedType: initialData.propertybedtype || "",
                propertyGuestPaxNo: initialData.propertyguestpaxno || "",
                propertyDescription: initialData.propertydescription || "",
                facilities: facilitiesArray,
                propertyImage: initialData.propertyimage || [],
                clusterName: initialData.clustername || "",
                categoryName: initialData.categoryname || "",
            });
    
            // Set the selected facilities
            setSelectedFacilities(facilitiesArray);
        }
    }, [initialData]);

    useEffect(() => {
        if (window.google) {
            const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current);
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place && place.formatted_address) {
                    setFormData((prev) => ({ ...prev, nearbyLocation: place.formatted_address }));
                }
            });
        }
    }, []);

    const toggleFacility = (facilityName) => {
        setSelectedFacilities((prev) =>
            prev.includes(facilityName)
                ? prev.filter((name) => name !== facilityName)
                : [...prev, facilityName]
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const newFiles = Array.from(e.target.files);
        const imageFiles = newFiles.filter((file) => file.type.startsWith('image/'));

        // Warn if non-image files are selected
        if (imageFiles.length < newFiles.length) {
            setToastMessage('Only image files are allowed. Non-image files have been ignored.');
            setToastType('warning');
            setShowToast(true);
        }

        try {
            const resizedFiles = await Promise.all(
                imageFiles.map((file) => resizeImage(file, MAX_WIDTH, MAX_HEIGHT))
            );
            setFormData((prev) => ({
                ...prev,
                propertyImage: [...prev.propertyImage, ...resizedFiles],
            }));
        } catch (error) {
            console.error('Error resizing images:', error);
            setToastMessage('Error resizing images. Please try again.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleRemoveImage = (index) => {
        setFormData((prev) => {
            const updatedImages = [...prev.propertyImage];
            const removedImage = updatedImages.splice(index, 1)[0];
            if (!(removedImage instanceof File)) {
                setRemovedImages((prevRemoved) => [...prevRemoved, removedImage]);
            }
            return { ...prev, propertyImage: updatedImages };
        });
    };

   const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.propertyImage.length < 5) {
            setToastMessage("Please upload at least 5 images");
            setToastType("error");
            setShowToast(true);
            return;
        }
        if (formData.propertyImage.length > 10) {
            setToastMessage("You cannot upload more than 10 images");
            setToastType("error");
            setShowToast(true);
            return;
        }


        const data = new FormData();
        data.append("username", formData.username);
        data.append("propertyPrice", formData.propertyPrice);
        data.append("propertyAddress", formData.propertyAddress);
        data.append("nearbyLocation", formData.nearbyLocation);
        data.append("propertyBedType", formData.propertyBedType);
        data.append("propertyGuestPaxNo", formData.propertyGuestPaxNo);
        data.append("propertyDescription", formData.propertyDescription);
        data.append("facilities", selectedFacilities.join(","));
        data.append("clusterName", formData.clusterName);
        data.append("categoryName", formData.categoryName);

        if (!initialData) {
            data.append("propertyStatus", "Pending");
        }

        formData.propertyImage.forEach((file) => {
            if (file instanceof File) {
                data.append("propertyImage", file);
            }
        });
        data.append("removedImages", JSON.stringify(removedImages));

        try {
            let response;
            if (initialData) {
                const propertyid = initialData.propertyid || initialData.propertyID;
                response = await updateProperty(data, propertyid);
            } else {
                response = await propertiesListing(data);
                const { propertyID } = response;
                await propertyListingRequest(propertyID);
            }

            if (response && response.message) {
                setToastMessage(response.message);
                setToastType("success");
                setShowToast(true);
            }

            setFormData({
                username: "",
                propertyPrice: "",
                propertyAddress: "",
                nearbyLocation: "",
                propertyBedType: "1",
                propertyGuestPaxNo: "1",
                propertyDescription: "",
                facilities: [],
                propertyImage: [],
                clusterName: "",
                categoryName: "",
            });
            setRemovedImages([]);
            setSelectedFacilities([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            if (onSubmit) onSubmit();
        } catch (error) {
            setToastMessage(`Error: ${error.message}`);
            setToastType("error");
            setShowToast(true);
        }
    };

    const handleOverlayClick = (e) => e.stopPropagation();

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(formData.propertyImage);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFormData((prev) => ({ ...prev, propertyImage: items }));
    };

    const getImageLabel = (index) =>
        index === 0 ? "Main Image" : index <= 4 ? "Secondary Image" : "Additional Image";

    const getLabelStyle = (index) => ({
        backgroundColor: index === 0 ? '#4CAF50' : index <= 4 ? '#2196F3' : '#9E9E9E',
        color: 'white',
    });

    return (
        <div className="property-form-overlay" onClick={onClose}>
            <div className="property-form-content" onClick={handleOverlayClick}>
                <h1>{initialData ? "Edit Property" : "Create a New Property"}</h1>
                <button onClick={onClose} className="property-form-close-button">×</button>
                <form onSubmit={handleSubmit} className="property-listing-form">
                    <div className="property-listing-form-group">
                        <label>Username:</label>
                        <input type="text" name="username" value={formData.username} readOnly required />
                    </div>
                    <div className="property-listing-form-group">
                        <label>Property Name:</label>
                        <input
                            type="text"
                            name="propertyAddress"
                            value={formData.propertyAddress}
                            onChange={handleChange}
                            placeholder="e.g. Property"
                            required
                        />
                    </div>
                    <div className="property-listing-form-group">
                        <label>Cluster (City):</label>
                        <select name="clusterName" value={formData.clusterName} onChange={handleChange} required>
                            <option value="">Select Cluster (City)</option>
                            {clusters.map((cluster) => (
                                <option key={cluster} value={cluster}>{cluster}</option>
                            ))}
                        </select>
                    </div>
                    <div className="property-listing-form-group">
                        <label>Categories:</label>
                        <select name="categoryName" value={formData.categoryName} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="property-listing-form-group">
                        <label>Property Price (MYR):</label>
                        <input
                            type="number"
                            name="propertyPrice"
                            value={formData.propertyPrice}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>
                    <div className="property-listing-form-group">
                        <label>Guest Capacity:</label>
                        <input
                            type="number"
                            name="propertyGuestPaxNo"
                            value={formData.propertyGuestPaxNo}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>
                    <div className="property-listing-form-group">
                        <label>Bed:</label>
                        <input
                            type="number"
                            name="propertyBedType"
                            value={formData.propertyBedType}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>
                    <div className="property-listing-form-group">
                        <label>Property Location:</label>
                        <input
                            type="text"
                            name="nearbyLocation"
                            value={formData.nearbyLocation}
                            onChange={handleChange}
                            placeholder="e.g. No.123, LOT 1234, Lorong 1, Jalan ABC, Kuching, Sarawak"
                            required
                            ref={locationInputRef}
                        />
                    </div>
                    <div className="property-listing-form-group full-width">
                        <label>Property Description:</label>
                        <textarea
                            name="propertyDescription"
                            value={formData.propertyDescription}
                            onChange={handleChange}
                            placeholder="e.g. This Property Has Good View"
                            required
                        />
                    </div>
                    <div className="property-listing-form-group full-width">
                        <label>Facilities</label>
                        <div className="Facilities-list">
                            {predefinedFacilities
                                .filter((facility) => !selectedFacilities.includes(facility.name))
                                .map((facility) => (
                                    <div
                                        value={facility.name}
                                        type="checkbox"
                                        checked={selectedFacilities.includes(facility.name)}
                                        onChange={handleChange}   
                                        className="facility-item"
                                        onClick={() => toggleFacility(facility.name)}
                                    >
                                        {facility.icon} {facility.name}
                                    </div>
                                ))}
                        </div>
                    </div>
                    {selectedFacilities.length > 0 && (
                        <div className="property-listing-form-group full-width">
                            <label>Selected Facilities</label>
                            <div className="Facilities-list">
                                {selectedFacilities.map((facilityName) => {
                                    const facility = predefinedFacilities.find((f) => f.name === facilityName);
                                    return (
                                        <div
                                            key={facilityName}
                                            className="selected-facility-item"
                                            onClick={() => toggleFacility(facilityName)}
                                        >
                                            {facility.icon} {facilityName}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="property-listing-form-group full-width">
                        <label>Property Image:</label>
                        <input
                            type="file"
                            name="propertyImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            multiple
                        />
                        {formData.propertyImage.length < 5 && (
                            <div className="validation-warning">
                                Minimum 5 images required ({formData.propertyImage.length}/5 uploaded)
                            </div>
                        )}
                    </div>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="existing-images-container"
                                >
                                    {formData.propertyImage.map((image, index) => (
                                        <Draggable
                                            key={image instanceof File ? image.name : `image-${index}`}
                                            draggableId={image instanceof File ? image.name : `image-${index}`}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="image-item"
                                                >
                                                    <div className="image-label" style={getLabelStyle(index)}>
                                                        {getImageLabel(index)}
                                                    </div>
                                                    {image instanceof File ? (
                                                        <img src={URL.createObjectURL(image)} alt="Property" />
                                                    ) : (
                                                        <img src={`data:image/jpeg;base64,${image}`} alt="Property" />
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="remove-image-btn"
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <button type="submit" className="property-listing-submit-button">
                        {initialData ? "Update Property" : "Create Property"}
                    </button>
                </form>
                {showToast && <Toast type={toastType} message={toastMessage} />}
            </div>
        </div>
    );
};

export default PropertyForm;
