import React, { useState, useEffect } from 'react';
import { fetchCustomers } from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import { FaEye, FaUserTag } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Customers.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleCustomer, setRoleCustomer] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;
    
    const roles = ['Customer', 'Moderator', 'Administrator'];

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const customerData = await fetchCustomers();
                setCustomers(customerData);
            } catch (error) {
                console.error('Failed to fetch customer details', error);
            }
        };
        fetchCustomerData();
    }, []);

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
            } else {
                console.error('Failed to assign role:', data.message);
            }
        } catch (error) {
            console.error('Error assigning role:', error);
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
        { header: 'First Name', accessor: 'ufirstname' },
        { header: 'Last Name', accessor: 'ulastname' },
        { header: 'Email', accessor: 'uemail' },
        { header: 'Phone', accessor: 'uphoneno' },
        { header: 'Role', accessor: 'usergroup' },
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
            <div className="header-container">
                <h1 className="dashboard-page-title">Customer Details</h1>
                <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search customers..." />
            </div>

            <PaginatedTable
                data={filteredCustomers}
                columns={columns}
                rowKey="userid"
                enableCheckbox={false}
            />

            <Modal
                isOpen={!!selectedCustomer}
                title={`${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`}
                data={selectedCustomer || {}}
                labels={displayLabels}
                onClose={() => setSelectedCustomer(null)}
            />
            
            {/* Role Assignment Modal */}
            {showRoleModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Assign Role to {roleCustomer?.ufirstname} {roleCustomer?.ulastname}</h2>
                            <button className="close-button" onClick={() => setShowRoleModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="role" className="role-label">Select Role:</label>
                                <select 
                                    id="role" 
                                    value={selectedRole} 
                                    onChange={handleRoleChange}
                                    className="role-select"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="button-group">
                                <button 
                                    className="cancel-button" 
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="assign-button" 
                                    onClick={handleRoleSubmit}
                                >
                                    Assign Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
