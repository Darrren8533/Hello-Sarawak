import React, { useState, useEffect } from 'react';
import { fetchCustomers } from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Role from '../../../../Component/Role/Role';
import RoleManager from '../../../../Component/RoleManager/RoleManager';
import UserActivityCell from '../../../../Component/UserActivityCell/UserActivityCell';
import { FaEye, FaUserTag } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Customers.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleCustomer, setRoleCustomer] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;
    
    const roles = ['Customer', 'Moderator', 'Administrator'];

    const displayToast = (type, message) => {
        setToastType(type);
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const { data: customerData = [], isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: fetchCustomers,
        onError: (error) => {
            console.error('Failed to fetch customer details', error);
            displayToast('error', 'Failed to load customers. Please try again.');
        },
        staleTime: 5 * 60 * 1000,
    });

    setCustomers(customerData);

    const handleAction = (action, customer) => {
        if (action === 'view') {
            const essentialFields = {
                firstName: customer.ufirstname || 'N/A',
                lastName: customer.ulastname || 'N/A',
                email: customer.uemail || 'N/A',
                phoneNo: customer.uphoneno || 'N/A',
                gender: customer.ugender || 'N/A',
                country: customer.ucountry || 'N/A',
            };
            setSelectedCustomer(essentialFields);
        } else if (action === 'assignRole') {
            setRoleCustomer(customer);
            setSelectedRole(customer.usergroup || 'Customer');
            setShowRoleModal(true);
        }
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleRoleSubmit = async () => {
        try {
            const response = await fetch(`${API_URL}/users/assignRole`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userid: roleCustomer.userid,
                    role: selectedRole
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                // Update local state
                setCustomers(customers.map(customer => 
                    customer.userid === roleCustomer.userid 
                        ? {...customer, usergroup: selectedRole} 
                        : customer
                ));
                setShowRoleModal(false);
                displayToast('success', `Successfully assigned ${selectedRole} role to ${roleCustomer.username}`);
            } else {
                console.error('Failed to assign role:', data.message);
                displayToast('error', `Failed to assign role: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error assigning role:', error);
            displayToast('error', 'Error assigning role. Please try again.');
        }
    };

    const customerDropdownItems = [
        { label: 'View Details', icon: <FaEye />, action: 'view' },
        { label: 'Assign Role', icon: <FaUserTag />, action: 'assignRole' },
    ];

    const displayLabels = {
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        phoneNo: "Phone Number",
        gender: "Gender",
        country: "Country"
    };

    const columns = [
        {
            header: 'Customer',
            accessor: 'customer',
            render: (customer) => (
               <UserActivityCell user={customer} />
            ),
        },
        { header: 'Email', accessor: 'uemail' },
        { header: 'Phone', accessor: 'uphoneno' },
        {
            header: 'Role',
            accessor: 'usergroup',
            render: (customer) => (
               <Role role={customer.usergroup || 'Customer'} />
            ),
        },
        
        {
            header: 'Actions',
            accessor: 'actions',
            render: (customer) => (
                <ActionDropdown
                    items={customerDropdownItems}
                    onAction={(action) => handleAction(action, customer)}
                    onClose={() => {}}
                />
            ),
        },
    ];

    const filteredCustomers = customers.filter((customer) =>
        `${customer.ufirstname} ${customer.ulastname} ${customer.uemail} ${customer.uphoneno}`
            .toLowerCase()
            .includes(searchKey.toLowerCase())
    );

    return (
        <div>
            {showToast && <Toast type={toastType} message={toastMessage} />}
            
            <div className="header-container">
                <h1 className="dashboard-page-title">Customer Details</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search customers..." />
            </div>

            {isLoading ? (
                <div className="loader-box">
                    <Loader />
                </div>
            ) : (
            <PaginatedTable
                data={filteredCustomers}
                columns={columns}
                rowKey="userid"
                enableCheckbox={false}
            />
            )}

            <Modal
                isOpen={!!selectedCustomer}
                title={`${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`}
                data={selectedCustomer || {}}
                labels={displayLabels}
                onClose={() => setSelectedCustomer(null)}
            />
            
            <RoleManager
                isOpen={showRoleModal}
                user={roleCustomer}
                roles={roles}
                selectedRole={selectedRole}
                onRoleChange={handleRoleChange}
                onSubmit={handleRoleSubmit}
                onClose={() => setShowRoleModal(false)}
            />
        </div>
    );
};

export default Customers;
