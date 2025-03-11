import React, { useState, useEffect } from 'react';
import { fetchPropertiesListingTable, deleteProperty } from '../../../../../../Backend/Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import PropertyForm from '../../../../Component/PropertyForm/PropertyForm';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Alert from '../../../../Component/Alert/Alert';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
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

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
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
                (property) => property.propertyID !== undefined
            );
            setProperties(validProperties);
        } catch (error) {
            console.error('Failed to fetch property details', error);
            displayToast('error', 'Failed to load properties. Please try again.');
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
        propertyName: "Property Name",
        clusterName: "Cluster Name",
        categoryName: "Category Name",
        propertyPrice: "Property Price",
        propertyLocation: "Property Location",
        propertyGuestPaxNo: "Guest Capacity",
        propertyStatus: "Property Status",
        propertyBedType: "Bed Type",
        propertyDescription: "Description",
        images: "Images",
        username: "Operator Name"
    };

    const filteredProperties = properties.filter(
        (property) =>
            (appliedFilters.status === 'All' ||
                (property.propertyStatus ?? 'Pending').toLowerCase() ===
                    appliedFilters.status.toLowerCase()) &&
            (
                (property.propertyID?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyAddress?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.nearbyLocation?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.rateAmount?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyStatus?.toLowerCase().includes(searchKey.toLowerCase()) || '')
            )
    );

    const handleAction = async (action, property) => {
        if (action === 'view') {
            setSelectedProperty({
                propertyName: property.propertyAddress || 'N/A',
                clusterName: property.clusterName || 'N/A',
                categoryName: property.categoryName || 'N/A',
                propertyPrice: property.rateAmount|| 'N/A',
                propertyLocation: property.nearbyLocation || 'N/A',
                propertyGuestPaxNo: property.propertyGuestPaxNo || 'N/A',
                propertyStatus: property.propertyStatus || 'N/A',
                propertyBedType: property.propertyBedType || 'N/A',
                propertyDescription: property.propertyDescription || 'N/A',
                images: property.propertyImage || [],
                username: property.username || 'N/A',
            });
        } else if (action === 'edit') {
            setEditProperty(property);
            setIsPropertyFormOpen(true);
        } else if (action === 'delete') {
            setPropertyToDelete(property.propertyID);
            setIsDialogOpen(true);
        }
    };

    const handleDeleteProperty = async () => {
        try {
            await deleteProperty(propertyToDelete);
            setProperties((prevProperties) =>
                prevProperties.filter((property) => property.propertyID !== propertyToDelete)
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

    const propertyDropdownItems = (propertyStatus) => {
        if (propertyStatus === 'Pending') {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Edit', icon: <FaEdit />, action: 'edit' },
            ];
        } else if (propertyStatus === 'Unavailable') {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Delete', icon: <FaTrash />, action: 'delete' },
            ];
        }
        return [{ label: 'View Details', icon: <FaEye />, action: 'view' }];
    };

    const columns = [
        { header: 'ID', accessor: 'propertyID' },
        {
            header: 'Image',
            accessor: 'propertyImage',
            render: (property) =>
                property.propertyImage && property.propertyImage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${property.propertyImage[0]}`}
                        alt={property.propertyName}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                ),
        },
        { header: 'Name', accessor: 'propertyAddress' },
        { header: 'Price', accessor: 'rateAmount' },
        { header: 'Location', accessor: 'nearbyLocation' },
        {
            header: 'Status',
            accessor: 'propertyStatus',
            render: (property) => (
                <span
                    className={`property-status ${
                        (property.propertyStatus ?? 'Pending').toLowerCase()
                    }`}
                >
                    {property.propertyStatus || 'Pending'}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (property) => (
                <ActionDropdown
                    items={propertyDropdownItems(property.propertyStatus)}
                    onAction={(action) => handleAction(action, property)}
                />
            ),
        },
    ];

    const handleOpenCreateForm = () => {
        setEditProperty(null);
        setIsPropertyFormOpen(true);
    };

    return (
        <div>
            <div className="header-container">
                <h1 className="dashboard-page-title">Property Listings</h1>
                <SearchBar
                    value={searchKey}
                    onChange={(newValue) => setSearchKey(newValue)}
                    placeholder="Search properties..."
                />
            </div>

            <Filter filters={filters} onApplyFilters={handleApplyFilters} />
            <button
                className="create-property-button"
                onClick={handleOpenCreateForm}
            >
                Create New Property
            </button>

            <PaginatedTable
                data={filteredProperties}
                columns={columns}
                rowKey="propertyID"
            />

            <Modal
                isOpen={!!selectedProperty}
                title={`Property: ${selectedProperty?.propertyName}`}
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
                        displayToast(
                            'success',
                            editProperty
                                ? 'Property updated successfully'
                                : 'Property created successfully'
                        );
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