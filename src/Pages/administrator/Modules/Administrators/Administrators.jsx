import React, { useState, useEffect } from 'react';
import { fetchAdministrators } from '../../../../../../Backend/Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import { FaEye } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Administrator.css';

const Administrators = () => {
  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
  const [selectedOperator, setSelectedOperator] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const operatorData = await fetchAdministrators();
        setUsers(operatorData);
      } catch (error) {
        console.error('Failed to fetch administrator details', error);
      }
    };
    fetchUsers();
  }, []);

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
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ];

  const displayLabels = {
    userID: 'User ID',
    uFirstName: 'First Name',
    uLastName: 'Last Name',
    uEmail: 'Email',
    uPhoneNo: 'Phone Number',
    uActivation: 'Status',
    uGender: 'Gender',
    uCountry: 'Country',
  };

  // Filter logic for both search key and status
  const filteredUsers = users.filter((user) => {
    const searchInFields =
      `${user.userID} ${user.uFirstName} ${user.uLastName} ${user.uEmail} ${user.uPhoneNo} ${user.uActivation}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const statusFilter =
      appliedFilters.status === 'All' || user.uActivation === appliedFilters.status;

    return searchInFields && statusFilter;
  });

  const handleAction = (action, user) => {
    if (action === 'view') {
      const essentialFields = {
        userID: user.userID || 'N/A',
        uFirstName: user.uFirstName || 'N/A',
        uLastName: user.uLastName || 'N/A',
        uEmail: user.uEmail || 'N/A',
        uPhoneNo: user.uPhoneNo || 'N/A',
        uActivation: user.uActivation || 'N/A',
        uGender: user.uGender || 'N/A',
        uCountry: user.uCountry || 'N/A',
      };
      setSelectedOperator(essentialFields);
    }
  };

  const operatorDropdownItems = [
    { label: 'View Details', icon: <FaEye />, action: 'view' },
  ];

  const columns = [
    { header: 'ID', accessor: 'userID' },
    { header: 'First Name', accessor: 'uFirstName' },
    { header: 'Last Name', accessor: 'uLastName' },
    { header: 'Email', accessor: 'uEmail' },
    { header: 'Phone', accessor: 'uPhoneNo' },
    {
      header: 'Status',
      accessor: 'uActivation',
      render: (user) => (
        <span className={`status-badge ${user.uActivation?.toLowerCase() || 'active'}`}>
          {user.uActivation || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (operator) => (
        <ActionDropdown
          items={operatorDropdownItems}
          onAction={(action) => handleAction(action, operator)}
          onClose={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Administrator Details</h1>
        <SearchBar
          value={searchKey}
          onChange={(newValue) => setSearchKey(newValue)}
          placeholder="Search administrators ..."
        />
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />

      <PaginatedTable
        data={filteredUsers}
        columns={columns}
        rowKey="userID"
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedOperator}
        title={`${selectedOperator?.uFirstName} ${selectedOperator?.uLastName}`}
        data={selectedOperator || {}}
        labels={displayLabels}
        onClose={() => setSelectedOperator(null)}
      />
    </div>
  );
};

export default Administrators;
