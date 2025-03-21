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

    // 修改displayLabels对象
    const displayLabels = {
        firstname: 'First Name',
        lastname: 'Last Name',
        email: 'Email',
        phoneno: 'Phone Number',
        uactivation: 'Status',  // 修改为小写
        gender: 'Gender',
        country: 'Country',
    };

    // 修改处理函数中的字段引用
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
            await handleSuspendUser(customer);
        } else if (action === 'activate') {
            await handleActivateUser(customer);
        }
    };

    // 修改suspend和activate函数
    const handleSuspendUser = async (customer) => {
        try {
            await suspendUser(customer.userid);
            setCustomers((prevUsers) =>
                prevUsers.map((c) => (c.userid === customer.userid ? { ...c, uactivation: 'Inactive' } : c))
            );
            displayToast('success', `User ${customer.ufirstname} ${customer.ulastname} has been suspended.`);
        } catch (error) {
            console.error('Failed to suspend user:', error);
            displayToast('error', 'Error suspending user');
        }
    };

    const handleActivateUser = async (customer) => {
        try {
            await activateUser(customer.userid);
            setCustomers((prevCustomers) =>
                prevCustomers.map((c) => (c.userid === customer.userid ? { ...c, uactivation: 'Active' } : c))
            );
            displayToast('success', `User ${customer.ufirstname} ${customer.ulastname} has been activated.`);
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


    // 修改字段引用，从驼峰式改为全小写
    const filteredCustomers = customers.filter(
        (customer) =>
            (appliedFilters.status === 'All' || customer.uactivation === appliedFilters.status) &&
            (
                `${customer.ufirstname} ${customer.ulastname} ${customer.uemail} ${customer.uphoneno} ${customer.uactivation}`
                    .toLowerCase()
                    .includes(searchKey.toLowerCase())
            )
    );

    const handleApplyFilters = () => {
        setAppliedFilters({ status: selectedStatus });
    };

    // 修改列定义
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

            <PaginatedTable
                data={filteredCustomers}
                columns={columns}
                rowKey="userID"
                enableCheckbox={false}
            />

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
