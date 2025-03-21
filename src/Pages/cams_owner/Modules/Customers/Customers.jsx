import React, { useState, useEffect } from 'react';
import { fetchCustomers } from '../../../../../Api/api';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import { FaEye } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Customers.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

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
        }
    };

    const customerDropdownItems = [
        { label: 'View Details', icon: <FaEye />, action: 'view' },
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
        </div>
    );
};

export default Customers;
