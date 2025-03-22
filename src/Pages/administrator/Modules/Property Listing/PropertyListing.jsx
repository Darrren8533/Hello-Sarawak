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
            setProperties(validProperties);
        } catch (error) {
            console.error('Failed to fetch property details', error);
            displayToast('error', 'Failed to load properties. Please try again.');
        }
    };

    const handleAction = async (action, property) => {
        if (action === 'view') {
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
                images: property.propertyimage || [],
                username: property.username || 'N/A',
            });
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
                // Allow delete only if Unavailable and owned by the logged-in user
                setPropertyToDelete(property.propertyid);
                setIsDialogOpen(true);
            } else {
                displayToast('error', 'You do not have permission to delete this property.');
            }
        }
    };
    
    
    const handleDeleteProperty = async () => {
        try {
            // Find the property to delete from the current properties list
            const property = properties.find((prop) => prop.propertyid === propertyToDelete);
    
            // If property is not found, show an error and return
            if (!property) {
                displayToast('error', 'Property not found. Please refresh the page and try again.');
                setIsDialogOpen(false);
                setPropertyToDelete(null);
                return;
            }
    
            // Check if the property status is not "Unavailable"
            if (property.propertystatus !== 'Unavailable') {
                displayToast('error', 'Only unavailable properties can be deleted.');
                setIsDialogOpen(false);
                setPropertyToDelete(null);
                return; // Exit the function
            }
    
            // Proceed with deletion if the property is "Unavailable"
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

        if (isAdmin) {
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
        }

        if (isModerator) {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
            ];
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
                    style={{ width: 80, height: 80 }}
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
                    onSubmit={() => {
                        setIsPropertyFormOpen(false);
                        fetchProperties();
                        displayToast('success', editProperty ? 'Property updated successfully' : 'Property created successfully');
                    }}
                    onClose={() => setIsPropertyFormOpen(false)}
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
