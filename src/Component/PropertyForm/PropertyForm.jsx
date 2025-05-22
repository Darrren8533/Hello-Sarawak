import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GiWashingMachine, GiClothesline, GiDesert  } from "react-icons/gi";
import { PiSecurityCamera } from "react-icons/pi";
import { SiLightning } from "react-icons/si";
import { TbPawFilled, TbPawOff } from "react-icons/tb";
import { MdLandscape, MdOutlineKingBed, MdFireplace, MdSmokingRooms, MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md";
import { FaWifi, FaDesktop, FaDumbbell, FaWater, FaSkiing, FaChargingStation, FaParking, FaSwimmingPool, FaTv, FaUtensils, FaSnowflake, FaSmokingBan, FaFireExtinguisher, FaFirstAid, FaShower, FaCoffee, FaUmbrellaBeach, FaBath, FaWind, FaBicycle, FaBabyCarriage, FaKey, FaBell, FaTree, FaCity } from "react-icons/fa";
import { propertiesListing, updateProperty, propertyListingRequest} from "../../../Api/api";
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
        // Essentials
        { name: "Wi-Fi", icon: <FaWifi />, category: "essentials" },
        { name: "Kitchen", icon: <FaUtensils />, category: "essentials" },
        { name: "Washer", icon: <GiWashingMachine />, category: "essentials" },
        { name: "Dryer", icon: <GiClothesline />, category: "essentials" },
        { name: "Air Conditioning", icon: <FaSnowflake />, category: "essentials" },
        { name: "Heating", icon: <FaWind />, category: "essentials" },
        { name: "Dedicated workspace", icon: <FaDesktop />, category: "essentials" },
        { name: "TV", icon: <FaTv />, category: "essentials" },

        // Features
        { name: "Free Parking", icon: <FaParking />, category: "features" },
        { name: "Swimming Pool", icon: <FaSwimmingPool />, category: "features" },
        { name: "Bathtub", icon: <FaBath />, category: "features" },
        { name: "EV charger", icon: <FaChargingStation />, category: "features" },
        { name: "Baby Crib", icon: <FaBabyCarriage />, category: "features" },
        { name: "King bed", icon: <MdOutlineKingBed />, category: "features" },
        { name: "Gym", icon: <FaDumbbell />, category: "features" },
        { name: "Breakfast", icon: <FaCoffee />, category: "features" },
        { name: "Indoor fireplace", icon: <MdFireplace />, category: "features" },
        { name: "Smoking allowed", icon: <MdSmokingRooms />, category: "features" },
        { name: "No Smoking", icon: <FaSmokingBan />, category: "features" },

        // Location
        { name: "City View", icon: <FaCity />, category: "location" },
        { name: "Garden", icon: <FaTree />, category: "location" },
        { name: "Bicycle Rental", icon: <FaBicycle />, category: "location" },
        { name: "Beachfront", icon: <FaUmbrellaBeach />, category: "location" },
        { name: "Waterfront", icon: <FaWater />, category: "location" },
        { name: "Countryside", icon: <MdLandscape />, category: "location" },
        { name: "Ski-in/ski-out", icon: <FaSkiing />, category: "location" },
        { name: "Desert", icon: <GiDesert />, category: "location" },
        
        // Safety
        { name: "Security Alarm", icon: <FaBell />, category: "safety" },
        { name: "Fire Extinguisher", icon: <FaFireExtinguisher />, category: "safety" },
        { name: "First Aid Kit", icon: <FaFirstAid />, category: "safety" },
        { name: "Security Camera", icon: <PiSecurityCamera />, category: "safety" },

        // Booking Options
        { name: "Instant booking", icon: <SiLightning />, category: "booking" },
        { name: "Self check-in", icon: <FaKey />, category: "booking" },
        { name: "Pets Allowed", icon: <TbPawFilled />, category: "booking" },
        { name: "No Pets", icon: <TbPawOff />, category: "booking" },
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
        "Apartment",
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

    // Add dynamic pricing state
    const [dynamicRates, setDynamicRates] = useState({
        normalRate: 0,
        weekendRate: 0,
        holidayRate: 0,
        specialEventRate: 0,
        earlyBirdDiscountRate: 0,
        lastMinuteDiscountRate: 0,
        period: ""
    });

    // Add state for rate toggles
    const [rateToggles, setRateToggles] = useState({
        weekendRate: false,
        holidayRate: false,
        specialEventRate: false,
        earlyBirdDiscountRate: false,
        lastMinuteDiscountRate: false
    });

    const [removedImages, setRemovedImages] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");
    const [selectedFacilities, setSelectedFacilities] = useState([]);
    const fileInputRef = useRef(null);
    const locationInputRef = useRef(null);
    const [showMoreAmenities, setShowMoreAmenities] = useState(false);
    const formStorageKey = 'property_form_data';

    // Load form data from localStorage on component mount
    useEffect(() => {
        // First try to load from localStorage
        const savedFormData = localStorage.getItem(formStorageKey);
        const savedImages = localStorage.getItem(`${formStorageKey}_images`);
        
        if (savedFormData) {
            try {
                const parsedData = JSON.parse(savedFormData);
                let propertyImageArray = [];
                
                // Load saved images if available
                if (savedImages) {
                    const parsedImages = JSON.parse(savedImages);
                    
                    // Process each saved image
                    propertyImageArray = parsedImages.map(img => {
                        if (img.isFile) {
                            // Convert back to File object
                            const byteString = atob(img.base64.split(',')[1]);
                            const arrayBuffer = new ArrayBuffer(byteString.length);
                            const uint8Array = new Uint8Array(arrayBuffer);
                            
                            for (let i = 0; i < byteString.length; i++) {
                                uint8Array[i] = byteString.charCodeAt(i);
                            }
                            
                            return new File([arrayBuffer], img.name, {
                                type: img.type,
                                lastModified: img.lastModified
                            });
                        } else {
                            // Return the base64 string as is
                            return img.data;
                        }
                    });
                }
                
                // Load saved dynamic rates if available
                if (parsedData.dynamicRates) {
                    setDynamicRates(parsedData.dynamicRates);
                    
                    // Set toggles based on saved rates
                    if (parsedData.rateToggles) {
                        setRateToggles(parsedData.rateToggles);
                    } else {
                        // Initialize toggles based on rate values
                        setRateToggles({
                            weekendRate: parsedData.dynamicRates.weekendRate > 0,
                            holidayRate: parsedData.dynamicRates.holidayRate > 0,
                            specialEventRate: parsedData.dynamicRates.specialEventRate > 0,
                            earlyBirdDiscountRate: parsedData.dynamicRates.earlyBirdDiscountRate > 0,
                            lastMinuteDiscountRate: parsedData.dynamicRates.lastMinuteDiscountRate > 0
                        });
                    }
                }
                
                // Set the form data with processed image data
                setFormData({
                    ...parsedData,
                    propertyImage: propertyImageArray
                });
                
                // Also set selected facilities
                if (parsedData.facilities && Array.isArray(parsedData.facilities)) {
                    setSelectedFacilities(parsedData.facilities);
                }
                
                return; // Skip initialData processing if we loaded from localStorage
            } catch (error) {
                console.error("Error loading saved form data:", error);
            }
        }

        // If no localStorage data or error, proceed with initialData
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setFormData((prev) => ({ ...prev, username: storedUsername }));
        }
    
        if (initialData) {
            let facilitiesArray = [];
            
            if (initialData.facilities) {
                if (typeof initialData.facilities === 'string') {
                    facilitiesArray = initialData.facilities.trim() 
                        ? initialData.facilities.split(",").map(facility => facility.trim())
                        : [];
                } else if (Array.isArray(initialData.facilities)) {
                    facilitiesArray = initialData.facilities;
                }
            }
            
            setFormData({
                username: initialData.username || storedUsername || "",
                propertyPrice: initialData.normalrate || "",
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
            
            // Set dynamic rates if available
            if (initialData.rates) {
                const rates = {
                    normalRate: initialData.rates.normalRate || initialData.normalrate || 0,
                    weekendRate: initialData.rates.weekendRate || 0,
                    holidayRate: initialData.rates.holidayRate || 0,
                    specialEventRate: initialData.rates.specialEventRate || 0,
                    earlyBirdDiscountRate: initialData.rates.earlyBirdDiscountRate || 0,
                    lastMinuteDiscountRate: initialData.rates.lastMinuteDiscountRate || 0,
                    period: initialData.rates.period || ""
                };
                
                setDynamicRates(rates);
                
                // Initialize toggles based on rate values
                setRateToggles({
                    weekendRate: rates.weekendRate > 0,
                    holidayRate: rates.holidayRate > 0,
                    specialEventRate: rates.specialEventRate > 0,
                    earlyBirdDiscountRate: rates.earlyBirdDiscountRate > 0,
                    lastMinuteDiscountRate: rates.lastMinuteDiscountRate > 0
                });
            } else {
                // Initialize with property price as normal rate
                setDynamicRates(prev => ({
                    ...prev,
                    normalRate: initialData.normalrate || 0
                }));
            }
    
            // Set the selected facilities
            setSelectedFacilities(facilitiesArray);
        }
    }, [initialData]);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        // Don't save empty form data
        if (formData.username || formData.propertyAddress || formData.propertyImage.length > 0) {
            // Create a safe-to-serialize copy of the form data
            const dataToSave = {
                ...formData,
                // Remove propertyImage as we'll handle it separately
                propertyImage: [],
                facilities: selectedFacilities,
                dynamicRates: dynamicRates,
                rateToggles: rateToggles
            };
            
            // Process images for storage
            saveImagesToLocalStorage(formData.propertyImage);
            
            localStorage.setItem(formStorageKey, JSON.stringify(dataToSave));
        }
    }, [formData, selectedFacilities, dynamicRates, rateToggles]);

    // Function to convert and save File objects to localStorage
    const saveImagesToLocalStorage = async (images) => {
        try {
            const imageStorage = [];
            
            // Process each image - either File objects or base64 strings
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                
                if (image instanceof File) {
                    // Convert File to base64
                    const base64 = await fileToBase64(image);
                    imageStorage.push({
                        isFile: true,
                        name: image.name,
                        type: image.type,
                        base64: base64,
                        lastModified: image.lastModified
                    });
                } else {
                    // Already a base64 string from the server
                    imageStorage.push({
                        isFile: false,
                        data: image
                    });
                }
            }
            
            localStorage.setItem(`${formStorageKey}_images`, JSON.stringify(imageStorage));
        } catch (error) {
            console.error("Error saving images to localStorage:", error);
        }
    };

    // Helper function to convert File to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    useEffect(() => {
        if (initialData?.facilities) {
          const selected = initialData.facilities.split(',').map(f => f.trim());
          setSelectedFacilities(selected);
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
        setSelectedFacilities((prev) => {
            // Handle mutual exclusivity between smoking options
            if (facilityName === "Smoking allowed") {
                return prev.includes("No Smoking")
                    ? prev.filter(name => name !== "No Smoking").concat(facilityName)
                    : prev.includes(facilityName)
                        ? prev.filter(name => name !== facilityName)
                        : [...prev, facilityName];
            } else if (facilityName === "No Smoking") {
                return prev.includes("Smoking allowed")
                    ? prev.filter(name => name !== "Smoking allowed").concat(facilityName)
                    : prev.includes(facilityName)
                        ? prev.filter(name => name !== facilityName)
                        : [...prev, facilityName];
            }
            
            // Handle mutual exclusivity between pets options
            if (facilityName === "Pets Allowed") {
                return prev.includes("No Pets")
                    ? prev.filter(name => name !== "No Pets").concat(facilityName)
                    : prev.includes(facilityName)
                        ? prev.filter(name => name !== facilityName)
                        : [...prev, facilityName];
            } else if (facilityName === "No Pets") {
                return prev.includes("Pets Allowed")
                    ? prev.filter(name => name !== "Pets Allowed").concat(facilityName)
                    : prev.includes(facilityName)
                        ? prev.filter(name => name !== facilityName)
                        : [...prev, facilityName];
            }
            
            // Handle all other facilities normally
            return prev.includes(facilityName)
                ? prev.filter((name) => name !== facilityName)
                : [...prev, facilityName];
        });
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

    // Handle dynamic rates change
    const handleRateChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value);
        
        // If this is normalRate, update propertyPrice too
        if (name === 'normalRate') {
            setFormData(prev => ({
                ...prev,
                propertyPrice: value
            }));
        }
        
        setDynamicRates(prev => ({
            ...prev,
            [name]: numValue >= 0 ? numValue : 0
        }));
    };

    // Handle toggle change for rates
    const handleToggleChange = (rateName) => {
        setRateToggles(prev => {
            const newState = { ...prev, [rateName]: !prev[rateName] };
            
            // If toggling off, set the rate to 0
            if (!newState[rateName]) {
                setDynamicRates(prevRates => ({
                    ...prevRates,
                    [rateName]: 0
                }));
            }
            
            return newState;
        });
    };

    // Validate that rates don't exceed normal rate
    const validateRates = () => {
        const { normalRate } = dynamicRates;
        const maxRate = parseFloat(normalRate);
        let isValid = true;
        
        Object.entries(dynamicRates).forEach(([key, value]) => {
            // Skip normalRate and period validation
            if (key === 'normalRate' || key === 'period') return;
            
            // Skip validation for disabled rates
            if (!rateToggles[key]) return;
            
            const rateValue = parseFloat(value);
            
            // Special case for weekend rate - can be 0 to disable weekend pricing
            if (key === 'weekendRate' && rateValue === 0) {
                return; // Skip validation for weekend rate if it's 0 (disabled)
            }
            
            if (rateValue > maxRate) {
                setToastMessage(`${key} cannot exceed the normal rate`);
                setToastType("error");
                setShowToast(true);
                isValid = false;
            }
        });
        
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.propertyImage.length < 4) {
            setToastMessage("Please upload at least 4 images");
            setToastType("error");
            setShowToast(true);
            return;
        }

        // Validate rates
        if (!validateRates()) {
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
            let propertyId;
            
            if (initialData) {
                propertyId = initialData.propertyid || initialData.propertyID;
                response = await updateProperty(data, propertyId);
            } else {
                const usergroup = localStorage.getItem("usergroup");

                if (usergroup === "Administrator") {
                    response = await propertiesListing(data);
                    propertyId = response.propertyid;
                } else if (usergroup === "Moderator") {
                    response = await propertiesListing(data);
                    propertyId = response.propertyid;
                    await propertyListingRequest(propertyId);
                }
            }
            
           
            if (response && response.message) {
                setToastMessage(response.message);
                setToastType("success");
                setShowToast(true);
            }

            // Clear form data and localStorage on successful submission
            localStorage.removeItem(formStorageKey);
            localStorage.removeItem(`${formStorageKey}_images`);
            
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

            onSubmit();
        } catch (error) {
            console.error("Error submitting form:", error);
            setToastMessage("Error submitting form. Please try again.");
            setToastType("error");
            setShowToast(true);
        }
    };

    const handleReset = () => {
        // Clear localStorage data
        localStorage.removeItem(formStorageKey);
        localStorage.removeItem(`${formStorageKey}_images`);
        
        setFormData({
            username: localStorage.getItem("username") || "",
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
        setRemovedImages([]);
        setSelectedFacilities([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleOverlayClick = (e) => e.stopPropagation();

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        // Don't do anything if dropped in the same position
        if (result.destination.index === result.source.index) return;
        
        const items = Array.from(formData.propertyImage);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        // Update the form data with the new order
        setFormData((prev) => ({ ...prev, propertyImage: items }));
    };

    // Add an info message about image dragging
    const imageInfoText = 
        formData.propertyImage.length > 0 
            ? "Drag images to reorder. The first image will be the main display image." 
            : "";

    const getImageLabel = (index) =>
        index === 0 ? "Main Image" : index <= 2 ? "Secondary Image" : "Additional Image";

    const getLabelStyle = (index) => ({
        backgroundColor: index === 0 ? '#4CAF50' : index <= 2 ? '#2196F3' : '#9E9E9E',
        color: 'white',
    });

    return (
        <div className="property-form-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="property-form-content">
                <div className="property-form-header">
                    <h1>{initialData ? "Edit Property" : "Create a New Property"}</h1>
                    <div className="property-form-header-buttons">
                        <button onClick={onClose} className="property-form-close-button">×</button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="property-form-listing-form">
                    <div className="property-form-section full-width">
                        <h3>Property Details</h3>
                        <div className="property-form-details-grid">
                            <div className="property-form-group">
                                <label>Username:</label>
                                <input type="text" name="username" value={formData.username} readOnly required />
                            </div>
                            <div className="property-form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="propertyAddress"
                                    value={formData.propertyAddress}
                                    onChange={handleChange}
                                    placeholder="e.g. Property"
                                    required
                                />
                            </div>
                            <div className="property-form-group">
                                <label>Cluster (City):</label>
                                <select name="clusterName" value={formData.clusterName} onChange={handleChange} required>
                                    <option value="">Select Cluster (City)</option>
                                    {clusters.map((cluster) => (
                                        <option key={cluster} value={cluster}>{cluster}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="property-form-group">
                                <label>Category:</label>
                                <select name="categoryName" value={formData.categoryName} onChange={handleChange} required>
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="property-form-group">
                                <label>Price (MYR):</label>
                                <input
                                    type="number"
                                    name="propertyPrice"
                                    value={formData.propertyPrice}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="property-form-group">
                                <label>Capacity (Pax):</label>
                                <input
                                    type="number"
                                    name="propertyGuestPaxNo"
                                    value={formData.propertyGuestPaxNo}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="property-form-group">
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
                            <div className="property-form-group">
                                <label>Location:</label>
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
                            <div className="property-form-group full-width">
                                <label>Property Description:</label>
                                <textarea
                                    name="propertyDescription"
                                    value={formData.propertyDescription}
                                    onChange={handleChange}
                                    placeholder="e.g. This Property Has Good View"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    

                    
                    <div className="property-form-section full-width">
                        <h3>Facilities</h3>
                        <div className="property-form-filter-section">
                            <div className="property-form-essentials-section">
                                <h5>Essentials</h5>
                                <div className="property-form-amenities-grid">
                                    {predefinedFacilities
                                        .filter(facility => facility.category === "essentials")
                                        .map((facility) => (
                                            <div
                                                key={facility.name}
                                                className={`property-form-amenity-item ${selectedFacilities.includes(facility.name) ? 'selected' : ''}`}
                                                onClick={() => toggleFacility(facility.name)}
                                            >
                                                <span className="property-form-amenity-icon">{facility.icon}</span>
                                                <span className="property-form-amenity-text">{facility.name}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {!showMoreAmenities && (
                                <button className="property-form-show-more-button" onClick={() => setShowMoreAmenities(true)}>
                                    Show more <MdKeyboardArrowDown />
                                </button>
                            )}

                            {showMoreAmenities && (
                                <>
                                    <div className="property-form-features-section">
                                        <h5>Features</h5>
                                        <div className="property-form-amenities-grid">
                                            {predefinedFacilities
                                                .filter(facility => facility.category === "features")
                                                .map((facility) => (
                                                    <div
                                                        key={facility.name}
                                                        className={`property-form-amenity-item ${selectedFacilities.includes(facility.name) ? 'selected' : ''}`}
                                                        onClick={() => toggleFacility(facility.name)}
                                                    >
                                                        <span className="property-form-amenity-icon">{facility.icon}</span>
                                                        <span className="property-form-amenity-text">{facility.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <div className="property-form-location-section">
                                        <h5>Location</h5>
                                        <div className="property-form-amenities-grid">
                                            {predefinedFacilities
                                                .filter(facility => facility.category === "location")
                                                .map((facility) => (
                                                    <div
                                                        key={facility.name}
                                                        className={`property-form-amenity-item ${selectedFacilities.includes(facility.name) ? 'selected' : ''}`}
                                                        onClick={() => toggleFacility(facility.name)}
                                                    >
                                                        <span className="property-form-amenity-icon">{facility.icon}</span>
                                                        <span className="property-form-amenity-text">{facility.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <div className="property-form-safety-section">
                                        <h5>Safety</h5>
                                        <div className="property-form-amenities-grid">
                                            {predefinedFacilities
                                                .filter(facility => facility.category === "safety")
                                                .map((facility) => (
                                                    <div
                                                        key={facility.name}
                                                        className={`property-form-amenity-item ${selectedFacilities.includes(facility.name) ? 'selected' : ''}`}
                                                        onClick={() => toggleFacility(facility.name)}
                                                    >
                                                        <span className="property-form-amenity-icon">{facility.icon}</span>
                                                        <span className="property-form-amenity-text">{facility.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <div className="property-form-booking-section">
                                        <h5>Booking Options</h5>
                                        <div className="property-form-amenities-grid">
                                            {predefinedFacilities
                                                .filter(facility => facility.category === "booking")
                                                .map((facility) => (
                                                    <div
                                                        key={facility.name}
                                                        className={`property-form-amenity-item ${selectedFacilities.includes(facility.name) ? 'selected' : ''}`}
                                                        onClick={() => toggleFacility(facility.name)}
                                                    >
                                                        <span className="property-form-amenity-icon">{facility.icon}</span>
                                                        <span className="property-form-amenity-text">{facility.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <button className="property-form-show-less-button" onClick={() => setShowMoreAmenities(false)}>
                                        Show less <MdKeyboardArrowUp />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="property-form-section full-width">
                        <h3>Property Images</h3>
                        <div className="property-form-group">
                            <label>Upload Images:</label>
                            <input
                                type="file"
                                name="propertyImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                multiple
                            />
                            {formData.propertyImage.length < 4 && (
                                <div className="property-form-validation-warning">
                                    Minimum 4 images required ({formData.propertyImage.length}/4 uploaded)
                                </div>
                            )}
                            {formData.propertyImage.length > 0 && (
                                <div className="property-form-info-text">
                                    {imageInfoText}
                                </div>
                            )}
                        </div>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="images" direction="horizontal">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`property-form-existing-images-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                    >
                                        {formData.propertyImage.map((image, index) => (
                                            <Draggable
                                                key={image instanceof File ? `file-${image.name}-${index}` : `image-${index}`}
                                                draggableId={image instanceof File ? `file-${image.name}-${index}` : `image-${index}`}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`property-form-image-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                            transform: snapshot.isDragging ? `${provided.draggableProps.style.transform} scale(1.05)` : provided.draggableProps.style.transform
                                                        }}
                                                    >
                                                        <div className="property-form-image-label" style={getLabelStyle(index)}>
                                                            {getImageLabel(index)}
                                                        </div>
                                                        {image instanceof File ? (
                                                            <img src={URL.createObjectURL(image)} alt="Property" />
                                                        ) : (
                                                            <img src={`data:image/jpeg;base64,${image}`} alt="Property" />
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="property-form-remove-image-btn"
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
                    </div>
                    
                    <div className="property-form-button-group">
                        <button type="button" onClick={handleReset} className="property-form-reset-button">
                            Reset
                        </button>
                        <button type="submit" className="property-form-submit-button">
                            {initialData ? "Update Property" : "Create Property"}
                        </button>
                    </div>
                </form>
                {showToast && <Toast type={toastType} message={toastMessage} />}
            </div>
        </div>
    );
};

export default PropertyForm;
