import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCustomers, suspendUser, activateUser } from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Loader from '../../../../Component/Loader/Loader';
import { FaEye, FaBan, FaUser } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Customers.css';

const Customers = () => {
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' }); 
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');

    // Initialize QueryClient
    const queryClient = useQueryClient();

    // Fetch customers query
    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: fetchCustomers,
        onError: (error) => {
            console.error('Failed to fetch customer details', error);
            displayToast('error', 'Failed to load customers. Please try again.');
        }
    });

    // Define mutations
    const suspendMutation = useMutation({
        mutationFn: (userId) => suspendUser(userId),
        onSuccess: (_, userId) => {
            queryClient.setQueryData(['customers'], (oldData) =>
                oldData.map(c => c.userid === userId ? { ...c, uactivation: 'Inactive' } : c)
            );
            const customer = customers.find(c => c.userid === userId);
            displayToast('success', `User ${customer.ufirstname} ${customer.ulastname} has been suspended.`);
        },
        onError: (error) => {
            console.error('Failed to suspend user:', error);
            displayToast('error', 'Error suspending user');
        }
    });

    const activateMutation = useMutation({
        mutationFn: (userId) => activateUser(userId),
        onSuccess: (_, userId) => {
            queryClient.setQueryData(['customers'], (oldData) =>
                oldData.map(c => c.userid === userId ? { ...c, uactivation: 'Active' } : c)
            );
            const customer = customers.find(c => c.userid === userId);
            displayToast('success', `User ${customer.ufirstname} ${customer.ulastname} has been activated.`);
        },
        onError: (error) => {
            console.error('Failed to activate user:', error);
            displayToast('error', 'Error activating user');
        }
    });

    useEffect(() => {
        if (customers) {
            applyFilters();
        }
    }, [customers, searchKey, appliedFilters]);

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const applyFilters = () => {
        const filtered = customers.filter(
            (customer) =>
                (appliedFilters.status === 'All' || customer.uactivation === appliedFilters.status) &&
                (
                    `${customer.ufirstname} ${customer.ulastname} ${customer.uemail} ${customer.uphoneno} ${customer.uactivation}`
                        .toLowerCase()
                        .includes(searchKey.toLowerCase())
                )
        );
        setFilteredCustomers(filtered);
    };

    const filters = [
        {
            name: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
            ],
        },
    ];

    const displayLabels = {
        firstname: 'First Name',
        lastname: 'Last Name',
        email: 'Email',
        phoneno: 'Phone Number',
        uactivation: 'Status', 
        gender: 'Gender',
        country: 'Country',
    };

    const handleAction = async (action, customer) => {
        if (action === 'view') {
            const essentialFields = {
                firstname: customer.ufirstname || 'N/A',
                lastname: customer.ulastname || 'N/A',
                email: customer.uemail || 'N/A',
                phoneno: customer.uphoneno || 'N/A',
                gender: customer.ugender || 'N/A',
                country: customer.ucountry || 'N/A',
            };
            setSelectedCustomer(essentialFields);
        } else if (action === 'suspend') {
            suspendMutation.mutate(customer.userid);
        } else if (action === 'activate') {
            activateMutation.mutate(customer.userid);
        }
    };

    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    const customerDropdownItems = (customerStatus) => {
        if (customerStatus === 'Inactive') {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Activate', icon: <FaUser />, action: 'activate' },
            ];
        } else if (customerStatus === 'Active') {
            return [
                { label: 'View Details', icon: <FaEye />, action: 'view' },
                { label: 'Suspend', icon: <FaBan />, action: 'suspend' },
            ];
        }

        return [{ label: 'View Details', icon: <FaEye />, action: 'view' }];
    };

    const columns = [
        { header: 'First Name', accessor: 'ufirstname' },
        { header: 'Last Name', accessor: 'ulastname' },
        { header: 'Email', accessor: 'uemail' },
        { header: 'Phone', accessor: 'uphoneno' },
        {
            header: 'Status',
            accessor: 'uactivation',
            render: (customer) => (
                <span className={`status-badge ${(customer.uactivation || 'Active').toLowerCase()}`}>
                    {customer.uactivation || 'Active'}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (customer) => (
                <ActionDropdown
                    items={customerDropdownItems(customer.uactivation)}
                    onAction={(action) => handleAction(action, customer)}
                />
            ),
        },
    ];

    return (
        <div>
            <div className="header-container">
                <h1 className="dashboard-page-title">Customer Details</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search customers..." />
            </div>

            <Filter filters={filters} onApplyFilters={handleApplyFilters} />

            {isLoading ? (
                <div className="loader-box">
                    <Loader />
                </div>
            ) : (
                <PaginatedTable
                    data={filteredCustomers}
                    columns={columns}
                    rowKey="userID"
                    enableCheckbox={false}
                />
            )}

            <Modal
                isOpen={!!selectedCustomer}
                title={`${selectedCustomer?.firstname} ${selectedCustomer?.lastname}`}
                data={selectedCustomer || {}}
                labels={displayLabels}
                onClose={() => setSelectedCustomer(null)}
            />

            {showToast && <Toast type={toastType} message={toastMessage} />}
        </div>
    );
};

export default Customers;