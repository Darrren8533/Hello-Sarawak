import React, { useState, useEffect } from 'react';
import {fetchPropertiesListingTable,updatePropertyStatus,deleteProperty} from '../../../../../../Backend/Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import PropertyForm from '../../../../Component/PropertyForm/PropertyForm';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Alert from '../../../../Component/Alert/Alert';
import { FaEye} from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';


const PropertyListing = () => {
    const [properties, setProperties] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');


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

    const handleAction = (action, property) => {
        if (action === 'view') {
            setSelectedProperty({
                propertyName: property.propertyName || 'N/A',
                propertyPrice: property.propertyPrice || 'N/A',
                propertyLocation: property.propertyLocation || 'N/A',
                propertyGuestPaxNo: property.propertyGuestPaxNo || 'N/A',
                propertyStatus: property.propertyStatus || 'N/A',
                propertyBedType: property.propertyBedType || 'N/A',
                propertyDescription: property.propertyDescription || 'N/A',
                images: property.propertyImage || [],
                username:property.username || 'N/A',
            });
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
            (appliedFilters.status === 'All' || (property.propertyStatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
            (
                (property.propertyID?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyName?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyLocation?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyPrice?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyStatus?.toLowerCase().includes(searchKey.toLowerCase()) || '')
            )
    );

    const propertyDropdownItems = [
        { label: 'View Details', icon: <FaEye />, action: 'view' },
    ];

    const columns = [
        { header: 'ID', accessor: 'propertyID' },
        {
            header: 'Image',
            accessor: 'propertyImage',
            render: (property) => (
                property.propertyImage && property.propertyImage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${property.propertyImage[0]}`}
                        alt={property.propertyName}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                )
            )
        },
        { header: 'Name', accessor: 'propertyName' },
        { header: 'Price', accessor: 'propertyPrice' },
        { header: 'Location', accessor: 'propertyLocation' },
        {
            header: 'Status',
            accessor: 'propertyStatus',
            render: (property) => (
              <span className={`property-status ${(property.propertyStatus ?? 'Pending').toLowerCase()}`}>
                {property.propertyStatus || 'Pending'}
              </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (property) => (
                <ActionDropdown
                    items={propertyDropdownItems}
                    onAction={(action) => handleAction(action, property)}
                />
            )
        }
    ];

    return (
        <div>
            <div className="header-container">
                <h1 className="dashboard-page-title">Property Listings</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search properties..." />
            </div>

            <Filter filters={filters} onApplyFilters={handleApplyFilters} />

            <PaginatedTable
                data={filteredProperties}
                columns={columns}
                rowKey="propertyID"
              
            />

            <Modal
                isOpen={!!selectedProperty}
                title={`${selectedProperty?.propertyName}`}
                data={selectedProperty || {}}
                labels={displayLabels}
                onClose={() => setSelectedProperty(null)}
            />


            
            {showToast && <Toast type={toastType} message={toastMessage} />}
        </div>
    );
};

export default PropertyListing;
