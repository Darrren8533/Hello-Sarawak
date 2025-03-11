import React, { useState, useEffect } from 'react';
import { fetchCustomers, suspendUser, activateUser } from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import { FaEye, FaBan, FaUser } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Customers.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [appliedFilters, setAppliedFilters] = useState({ status: 'All' }); 
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const customerData = await fetchCustomers();
                setCustomers(customerData);
            } catch (error) {
                console.error('Failed to fetch customer details', error);
                displayToast('error', 'Failed to load customers. Please try again.');
            }
        };
        fetchCustomerData();
    }, []);

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
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
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phoneNo: 'Phone Number',
        uActivation: 'Status',
        gender: 'Gender',
        country: 'Country',
    };

    const handleAction = async (action, customer) => {
        if (action === 'view') {
            const essentialFields = {
                firstName: customer.uFirstName || 'N/A',
                lastName: customer.uLastName || 'N/A',
                email: customer.uEmail || 'N/A',
                phoneNo: customer.uPhoneNo || 'N/A',
                gender: customer.uGender || 'N/A',
                country: customer.uCountry || 'N/A',
            };
            setSelectedCustomer(essentialFields);
        } else if (action === 'suspend') {
            await handleSuspendUser(customer);
        } else if (action === 'activate') {
            await handleActivateUser(customer);
        }
    };

    const handleSuspendUser = async (customer) => {
        try {
            await suspendUser(customer.userID);
            setCustomers((prevUsers) =>
                prevUsers.map((c) => (c.userID === customer.userID ? { ...c, uActivation: 'Inactive' } : c))
            );
            displayToast('success', `User ${customer.uFirstName} ${customer.uLastName} has been suspended.`);
        } catch (error) {
            console.error('Failed to suspend user:', error);
            displayToast('error', 'Error suspending user');
        }
    };

    const handleActivateUser = async (customer) => {
        try {
            await activateUser(customer.userID);
            setCustomers((prevCustomers) =>
                prevCustomers.map((c) => (c.userID === customer.userID ? { ...c, uActivation: 'Active' } : c))
            );
            displayToast('success', `User ${customer.uFirstName} ${customer.uLastName} has been activated.`);
        } catch (error) {
            console.error('Failed to activate user:', error);
            displayToast('error', 'Error activating user');
        }
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


    const filteredCustomers = customers.filter(
        (customer) =>
            (appliedFilters.status === 'All' || customer.uActivation === appliedFilters.status) &&
            (
                `${customer.uFirstName} ${customer.uLastName} ${customer.uEmail} ${customer.uPhoneNo} ${customer.uActivation}`
                    .toLowerCase()
                    .includes(searchKey.toLowerCase())
            )
    );

    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    const columns = [
        { header: 'First Name', accessor: 'uFirstName' },
        { header: 'Last Name', accessor: 'uLastName' },
        { header: 'Email', accessor: 'uEmail' },
        { header: 'Phone', accessor: 'uPhoneNo' },
        {
            header: 'Status',
            accessor: 'uActivation',
            render: (customer) => (
                <span className={`status-badge ${(customer.uActivation || 'Active').toLowerCase()}`}>
                    {customer.uActivation || 'Active'}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (customer) => (
                <ActionDropdown
                    items={customerDropdownItems(customer.uActivation)}
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

            <PaginatedTable
                data={filteredCustomers}
                columns={columns}
                rowKey="userID"
                enableCheckbox={false}
            />

            <Modal
                isOpen={!!selectedCustomer}
                title={`${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`}
                data={selectedCustomer || {}}
                labels={displayLabels}
                onClose={() => setSelectedCustomer(null)}
            />

            {showToast && <Toast type={toastType} message={toastMessage} />}
        </div>
    );
};

export default Customers;
