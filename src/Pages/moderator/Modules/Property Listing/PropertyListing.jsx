import React, { useState, useEffect } from 'react';
import { fetchPropertiesListingTable, deleteProperty } from '../../../../../Api/api';
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
                (property) => property.propertyid !== undefined
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
            (appliedFilters.status === 'All' ||
                (property.propertystatus ?? 'Pending').toLowerCase() ===
                    appliedFilters.status.toLowerCase()) &&
            (
                (property.propertyid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyaddress?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.nearbylocation?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.rateamount?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertystatus?.toLowerCase().includes(searchKey.toLowerCase()) || '')
            )
    );

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
        } else if (action === 'edit') {
            setEditProperty(property);
            setIsPropertyFormOpen(true);
        } else if (action === 'delete') {
            setPropertyToDelete(property.propertyid);
            setIsDialogOpen(true);
        }
    };

    const handleDeleteProperty = async () => {
        try {
            await deleteProperty(propertyToDelete);
            setProperties((prevProperties) =>
                prevProperties.filter((property) => property.propertyid !== propertyToDelete)
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

    const propertyDropdownItems = (propertystatus) => {
        if (propertystatus === 'Pending') {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Edit', icon: <FaEdit />, action: 'edit' },
            ];
        } else if (propertystatus === 'Unavailable') {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Delete', icon: <FaTrash />, action: 'delete' },
            ];
        }
        return [{ label: 'View Details', icon: <FaEye />, action: 'view' }];
    };

    const columns = [
        { header: 'ID', accessor: 'propertyid' },
        {
            header: 'Image',
            accessor: 'propertyimage',
            render: (property) =>
                property.propertyimage && property.propertyimage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${property.propertyimage[0]}`}
                        alt={property.propertyname}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                ),
        },
        { header: 'Name', accessor: 'propertyaddress' },
        { header: 'Price', accessor: 'rateamount' },
        { header: 'Location', accessor: 'nearbylocation' },
        {
            header: 'Status',
            accessor: 'propertystatus',
            render: (property) => (
                <span
                    className={`property-status ${
                        (property.propertystatus ?? 'Pending').toLowerCase()
                    }`}
                >
                    {property.propertystatus || 'Pending'}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (property) => (
                <ActionDropdown
                    items={propertyDropdownItems(property.propertystatus)}
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
                rowKey="propertyid"
            />

            <Modal
                isOpen={!!selectedProperty}
                title={`Property: ${selectedProperty?.propertyname}`}
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
