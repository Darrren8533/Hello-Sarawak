import React, { useState } from 'react';
import {fetchPropertiesListingTable, updatePropertyStatus, deleteProperty} from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import PropertyForm from '../../../../Component/PropertyForm/PropertyForm';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Alert from '../../../../Component/Alert/Alert';
import Status from '../../../../Component/Status/Status';
import { FaEye} from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Loader from '../../../../Component/Loader/Loader';

const PropertyListing = () => {
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');
    
    const queryClient = useQueryClient();

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    // Use TanStack Query to fetch properties
    const { 
        data: propertiesData, 
        isLoading, 
        isError,
        error 
    } = useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            try {
                const propertyData = await fetchPropertiesListingTable();
                const validProperties = (propertyData?.properties || []).filter(
                    (property) => property.propertyid !== undefined
                );
                return validProperties;
            } catch (error) {
                throw new Error('Failed to fetch property details');
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes before considering data stale
        onError: (error) => {
            displayToast('error', 'Failed to load properties. Please try again.');
        }
    });

    // Use TanStack Mutation for updating property status
    const updateStatusMutation = useMutation({
        mutationFn: (data) => updatePropertyStatus(data.propertyId, data.newStatus),
        onSuccess: () => {
            // Invalidate and refetch properties after status change
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            displayToast('success', 'Property status updated successfully');
        },
        onError: (error) => {
            displayToast('error', 'Failed to update property status');
        }
    });

    // Use TanStack Mutation for deleting property
    const deletePropertyMutation = useMutation({
        mutationFn: (propertyId) => deleteProperty(propertyId),
        onSuccess: () => {
            // Invalidate and refetch properties after deletion
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            displayToast('success', 'Property deleted successfully');
        },
        onError: (error) => {
            displayToast('error', 'Failed to delete property');
        }
    });

    const handleAction = (action, property) => {
        if (action === 'view') {
            setSelectedProperty({
                propertyaddress: property.propertyaddress || 'N/A',
                rateamount: property.rateamount || 'N/A',
                nearbylocation: property.nearbylocation || 'N/A',
                propertyguestpaxno: property.propertyguestpaxno || 'N/A',
                propertystatus: property.propertystatus || 'N/A',
                propertybedtype: property.propertybedtype || 'N/A',
                propertydescription: property.propertydescription || 'N/A',
                images: property.propertyimage || [],
                username: property.username || 'N/A',
            });
        } else if (action === 'changeStatus') {
            // Example: Toggle between 'Available' and 'Unavailable'
            const newStatus = property.propertystatus === 'Available' ? 'Unavailable' : 'Available';
            updateStatusMutation.mutate({ 
                propertyId: property.propertyid, 
                newStatus: newStatus 
            });
        } else if (action === 'delete') {
            // Assuming you want to confirm before deletion
            if (window.confirm('Are you sure you want to delete this property?')) {
                deletePropertyMutation.mutate(property.propertyid);
            }
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
        propertyaddress: "Property Name",
        rateamount: "Property Price",
        nearbylocation: "Property Location",
        propertyguestpaxno: "Guest Capacity",
        propertystatus: "Property Status",
        propertybedtype: "Bed Type",
        propertydescription: "Description",
        images: "Images",
        username: "Operator Name"
    };

    // Get properties from the query data
    const properties = propertiesData || [];

    const filteredProperties = properties.filter(
        (property) =>
            (appliedFilters.status === 'All' || (property.propertystatus ?? 'Pending').toLowerCase() === appliedFilters.status.toLowerCase()) &&
            (
                (property.propertyid?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertyaddress?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.clustername?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.rateamount?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
                (property.propertystatus?.toLowerCase().includes(searchKey.toLowerCase()) || '')
            )
    );

    const propertyDropdownItems = [
        { label: 'View Details', icon: <FaEye />, action: 'view' },
        // Uncomment and customize these as needed:
        // { label: 'Change Status', icon: <FaExchangeAlt />, action: 'changeStatus' },
        // { label: 'Delete', icon: <FaTrash />, action: 'delete' },
    ];

    const columns = [
        { header: 'ID', accessor: 'propertyid' },
        {
            header: 'Image',
            accessor: 'propertyimage',
            render: (property) => (
                property.propertyimage && property.propertyimage.length > 0 ? (
                    <img
                        src={`data:image/jpeg;base64,${property.propertyimage[0]}`}
                        alt={property.propertyaddress}
                        style={{ width: 80, height: 80 }}
                    />
                ) : (
                    <span>No Image</span>
                )
            )
        },
        { header: 'Name', accessor: 'propertyaddress' },
        { header: 'Price', accessor: 'rateamount' },
        { header: 'Cluster', accessor: 'clustername' },
        {
            header: 'Status',
            accessor: 'propertystatus',
            render: (property) => (
                <Status value={property.propertystatus || 'Pending'} />
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

            {isLoading && <div className="loader-box">
                <Loader />
            </div>}
            
            {isError && (
                <Alert type="error" message={`Error: ${error.message || 'Failed to load properties'}`} />
            )}

            {!isLoading && !isError && (
                <PaginatedTable
                    data={filteredProperties}
                    columns={columns}
                    rowKey="propertyid"
                />
            )}

            <Modal
                isOpen={!!selectedProperty}
                title={`${selectedProperty?.propertyaddress}`}
                data={selectedProperty || {}}
                labels={displayLabels}
                onClose={() => setSelectedProperty(null)}
            />
            
            {showToast && <Toast type={toastType} message={toastMessage} />}
        </div>
    );
};

export default PropertyListing;