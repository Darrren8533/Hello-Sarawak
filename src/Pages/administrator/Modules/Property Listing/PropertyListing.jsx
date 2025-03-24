import React, { useState, useEffect } from 'react';
import { fetchPropertiesListingTable, updatePropertyStatus, deleteProperty, propertyListingAccept, propertyListingReject } from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import PropertyForm from '../../../../Component/PropertyForm/PropertyForm';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Alert from '../../../../Component/Alert/Alert';
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../Property Listing/PropertyListing.css';

// Image utilities
const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        // Create file reader
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {

                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }
                
                if (height > maxHeight) {
                    const ratio = maxHeight / height;
                    height = height * ratio;
                    width = width * ratio;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob conversion failed'));
                        return;
                    }

                    const resizedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    
                    resolve({
                        file: resizedFile,
                        dataUrl: canvas.toDataURL(file.type, quality),
                        width,
                        height,
                        size: blob.size,
                        originalSize: file.size
                    });
                }, file.type, quality);
            };
            
            img.onerror = (error) => {
                reject(error);
            };
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
    });
};

const resizeBase64Image = (base64String, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {

        if (!base64String || typeof base64String !== 'string') {
            reject(new Error('Invalid base64 string'));
            return;
        }

        const img = new Image();

        const dataUrl = base64String.includes('data:') 
            ? base64String 
            : `data:image/jpeg;base64,${base64String}`;
            
        img.src = dataUrl;
        
        img.onload = () => {

            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }
            
            if (height > maxHeight) {
                const ratio = maxHeight / height;
                height = height * ratio;
                width = width * ratio;
            }
            

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
            
            const base64Data = resizedBase64.split(',')[1];
            
            resolve({
                dataUrl: resizedBase64,
                base64Data: base64Data,
                width,
                height,
                originalWidth: img.width,
                originalHeight: img.height
            });
        };
        
        img.onerror = (error) => {
            reject(error);
        };
    });
};

const processPropertyImages = async (propertyImages, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    if (!propertyImages || !Array.isArray(propertyImages) || propertyImages.length === 0) {
        return [];
    }

    try {
        return await Promise.all(
            propertyImages.map(async (image) => {

                if (typeof image === 'string') {
                    const result = await resizeBase64Image(image, maxWidth, maxHeight, quality);
                    return result.base64Data;
                }
                return image;
            })
        );
    } catch (error) {
        console.error('Error processing property images:', error);
        return propertyImages;
    }
};

const PropertyListing = () => {
    const [properties, setProperties] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [editProperty, setEditProperty] = useState(null);
    const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [isProcessingImages, setIsProcessingImages] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const fetchProperties = async () => {
        try {
            const propertyData = await fetchPropertiesListingTable();
            const validProperties = (propertyData?.properties || []).filter(
                (property) => property.propertyid !== undefined
            );
            
            setIsProcessingImages(true);
            
            const propertiesWithOptimizedImages = await Promise.all(
                validProperties.map(async (property) => {
                    if (property.propertyimage && Array.isArray(property.propertyimage) && property.propertyimage.length > 0) {
                        try {
                            const optimizedImages = await processPropertyImages(property.propertyimage);
                            return { ...property, propertyimage: optimizedImages };
                        } catch (error) {
                            console.error(`Failed to optimize images for property ${property.propertyid}:`, error);
                            return property;
                        }
                    }
                    return property;
                })
            );
            
            setProperties(propertiesWithOptimizedImages);
            setIsProcessingImages(false);
        } catch (error) {
            console.error('Failed to fetch property details', error);
            displayToast('error', 'Failed to load properties. Please try again.');
            setIsProcessingImages(false);
        }
    };

    const handleAction = async (action, property) => {
        if (action === 'view') {

            let optimizedImages = property.propertyimage;
            if (property.propertyimage && Array.isArray(property.propertyimage) && property.propertyimage.length > 0) {
                try {
                    optimizedImages = await processPropertyImages(property.propertyimage);
                } catch (error) {
                    console.error('Failed to optimize images for view:', error);
                }
            }
            
            setSelectedProperty({
                propertyname: property.propertyaddress || 'N/A',
                clustername: property.clustername || 'N/A',
                categoryname: property.categoryname || 'N/A',
                propertyprice: property.rateamount|| 'N/A',
                propertylocation: property.nearbylocation || 'N/A',
                propertyguestpaxno: property.propertyguestpaxno || 'N/A',
                propertystatus: property.propertystatus || 'N/A',
                propertybedtype: property.propertybedtype || 'N/A',
                propertydescription: property.propertydescription || 'N/A',
                images: optimizedImages || [],
                username: property.username || 'N/A',
            });
        } else if (action === 'edit') {
            let optimizedImages = property.propertyimage;
            if (property.propertyimage && Array.isArray(property.propertyimage) && property.propertyimage.length > 0) {
                try {
                    optimizedImages = await processPropertyImages(property.propertyimage);
                } catch (error) {
                    console.error('Failed to optimize images for edit:', error);
                }
            }
            
            setEditProperty({
                ...property,
                propertyimage: optimizedImages
            });
            setIsPropertyFormOpen(true);
        } else if (action === 'accept') {
            const newStatus = 'Available';
            await propertyListingAccept(property.propertyid);
            updatePropertyStatus(property.propertyid, newStatus)
                .then(() => {
                    setProperties((prevProperties) =>
                        prevProperties.map((res) =>
                            res.propertyid === property.propertyid
                                ? { ...res, propertystatus: newStatus }
                                : res
                        )
                    );
                    displayToast('success', 'Property Listing Request Accepted Successfully');
                })
                .catch((error) => {
                    console.error('Failed to update property status', error);
                    displayToast('error', 'Failed to accept property listing request');
                });
        } else if (action === 'reject') {
            const newStatus = 'Unavailable';
            await propertyListingReject(property.propertyid);
            updatePropertyStatus(property.propertyid, newStatus)
                .then(() => {
                    setProperties((prevProperties) =>
                        prevProperties.map((res) =>
                            res.propertyid === property.propertyid
                                ? { ...res, propertystatus: newStatus }
                                : res
                        )
                    );
                    displayToast('success', 'Property Listing Request Rejected Successfully');
                })
                .catch((error) => {
                    console.error('Failed to update property status', error);
                    displayToast('error', 'Failed to reject property listing request');
                });
        } else if (action === 'delete') {
            if (property.propertystatus === 'Unavailable' && property.username === username) {
                setPropertyToDelete(property.propertyid);
                setIsDialogOpen(true);
            } else {
                displayToast('error', 'You do not have permission to delete this property.');
            }
        }
    };
    
    const handleDeleteProperty = async () => {
        try {
            const property = properties.find((prop) => prop.propertyid === propertyToDelete);
    
            if (!property) {
                displayToast('error', 'Property not found. Please refresh the page and try again.');
                setIsDialogOpen(false);
                setPropertyToDelete(null);
                return;
            }
    
            if (property.propertystatus !== 'Unavailable') {
                displayToast('error', 'Only unavailable properties can be deleted.');
                setIsDialogOpen(false);
                setPropertyToDelete(null);
                return;
            }
    
            await deleteProperty(propertyToDelete);
            setProperties((prevProperties) =>
                prevProperties.filter((prop) => prop.propertyid !== propertyToDelete)
            );
            displayToast('success', 'Property deleted successfully');
        } catch (error) {
            console.error('Failed to delete property:', error);
            displayToast('error', 'Failed to delete property. Please try again.');
        } finally {
            setIsDialogOpen(false);
            setPropertyToDelete(null);
        }
    };
    
    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    const filters = [
        {
            name: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
                { value: 'All', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Available', label: 'Available' },
                { value: 'Unavailable', label: 'Unavailable' },
            ],
        },
    ];

    const displayLabels = {
        propertyname: "Property Name",
        clustername: "Cluster Name",
        categoryname: "Category Name",
        propertyprice: "Property Price",
        propertylocation: "Property Location",
        propertyguestpaxno: "Guest Capacity",
        propertystatus: "Property Status",
        propertybedtype: "Bed Type",
        propertydescription: "Description",
        images: "Images",
        username: "Operator Name"
    };

    const filteredProperties = properties.filter(
        (property) =>
            (appliedFilters.status === 'All' || (property.propertystatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
            (
                (property.propertyid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyaddress?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.nearbylocation?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.rateamount?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertystatus?.toLowerCase().includes(searchKey.toLowerCase()) || '')
            )
    );

    const propertyDropdownItems = (property, username, usergroup) => {
        const isOwner = property.username === username; 
        const isModerator = usergroup === 'Moderator';
        const isAdmin = usergroup === 'Administrator';

        const { propertystatus } = property;

        if (isModerator) {
            if (propertystatus === 'Pending') {
                return [
                    { label: 'View Details', icon: <FaEye />, action: 'view' },
                ];
            } else if (propertystatus === 'Available') {
                return [
                    { label: 'View Details', icon: <FaEye />, action: 'view' },
                ];
            } else if (propertystatus === 'Unavailable') {
                return [
                    { label: 'View Details', icon: <FaEye />, action: 'view' },
                    { label: 'Edit', icon: <FaEdit />, action: 'edit' },
                ];
            }
        }

        if (isAdmin) {
            if (!isOwner) {
                if (property.username !== username && property.username.includes('admin')) {

                    return [{ label: 'View Details', icon: <FaEye />, action: 'view' }];
                }
                if (propertystatus === 'Pending') {
                    return [
                        { label: 'View Details', icon: <FaEye />, action: 'view' },
                        { label: 'Accept', icon: <FaCheck />, action: 'accept' },
                        { label: 'Reject', icon: <FaTimes />, action: 'reject' },
                    ];
                } else if (propertystatus === 'Available') {
                    return [
                        { label: 'View Details', icon: <FaEye />, action: 'view' },
                        { label: 'Reject', icon: <FaTimes />, action: 'reject' },
                    ];
                } else if (propertystatus === 'Unavailable') {
                    return [
                        { label: 'View Details', icon: <FaEye />, action: 'view' },
                        { label: 'Accept', icon: <FaCheck />, action: 'accept' },
                    ];
                }
            } else {
                // Admin managing their own property
                if (propertystatus === 'Available') {
                    return [
                        { label: 'View Details', icon: <FaEye />, action: 'view' },
                        { label: 'Reject', icon: <FaTimes />, action: 'reject' },
                    ];
                } else if (propertystatus === 'Unavailable') {
                    return [
                        { label: 'View Details', icon: <FaEye />, action: 'view' },
                        { label: 'Edit', icon: <FaEdit />, action: 'edit' },
                        { label: 'Accept', icon: <FaCheck />, action: 'accept' },
                        { label: 'Delete', icon: <FaTrash />, action: 'delete' },
                    ];
                }
            }
        }

        return [{ label: 'View Details', icon: <FaEye />, action: 'view' }];
    };

    const username = localStorage.getItem('username');
    const usergroup = localStorage.getItem('usergroup'); 

    const columns = [
        { header: 'ID', accessor: 'propertyid' },
        {
            header: 'Image',
            accessor: 'propertyimage',
            render: (property) => (
                property.propertyimage && property.propertyimage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${property.propertyimage[0]}`}
                        alt={property.propertyname}
                        style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                ) : (
                    <span>No Image</span>
                )
            ),
        },
        { header: 'Name', accessor: 'propertyaddress' },
        { header: 'Price', accessor: 'rateamount' },
        { header: 'Location', accessor: 'nearbylocation' },
        {
            header: 'Status',
            accessor: 'propertystatus',
            render: (property) => (
                <span className={`property-status ${(property.propertystatus ?? 'Pending').toLowerCase()}`}>
                    {property.propertystatus || 'Pending'}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (property) => (
                <ActionDropdown
                    items={propertyDropdownItems(property, username, usergroup)}
                    onAction={(action) => handleAction(action, property)}
                />
            ),
        },
    ];

    // Handle property form submission with image resizing
    const handlePropertyFormSubmit = async (formData, isEdit) => {
        try {
            setIsPropertyFormOpen(false);
            await fetchProperties();
            displayToast('success', isEdit ? 'Property updated successfully' : 'Property created successfully');
        } catch (error) {
            console.error('Error handling property form submission:', error);
            displayToast('error', 'Failed to process property. Please try again.');
        }
    };

    return (
        <div>
            <div className="header-container">
                <h1 className="dashboard-page-title">Property Listings</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search properties..." />
            </div>

            <Filter filters={filters} onApplyFilters={handleApplyFilters} />

            <button
                className="create-property-button"
                onClick={() => {
                    setEditProperty(null);
                    setIsPropertyFormOpen(true);
                }}
            >
                Create New Property
            </button>

            {isProcessingImages && (
                <div className="loading-message">Optimizing property images...</div>
            )}

            <PaginatedTable
                data={filteredProperties}
                columns={columns}
                rowKey="propertyid"
            />

            <Modal
                isOpen={!!selectedProperty}
                title={`${selectedProperty?.propertyname}`}
                data={selectedProperty || {}}
                labels={displayLabels}
                onClose={() => setSelectedProperty(null)}
            />

            {isPropertyFormOpen && (
                <PropertyForm
                    initialData={editProperty}
                    onSubmit={handlePropertyFormSubmit}
                    onClose={() => setIsPropertyFormOpen(false)}
                    resizeImage={resizeImage}
                    resizeBase64Image={resizeBase64Image}
                />
            )}

            <Alert
                isOpen={isDialogOpen}
                title="Confirm Delete"
                message="Are you sure you want to delete this property?"
                onConfirm={handleDeleteProperty}
                onCancel={() => setIsDialogOpen(false)}
            />

            {showToast && <Toast type={toastType} message={toastMessage} />}
        </div>
    );
};

export default PropertyListing;
