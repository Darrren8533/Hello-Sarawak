import React, { useState, useEffect } from 'react';
import { fetchOperators } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import { FaEye, FaBan } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import '../Operators/Operators.css';

const Operators = () => {
  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ role: 'All' });
  const [selectedOperator, setSelectedOperator] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const operatorData = await fetchOperators();
        setUsers(operatorData);
      } catch (error) {
        console.error('Failed to fetch operator details', error);
      }
    };
    fetchUsers();
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({ role: selectedRole });
  };

  const filters = [
    {
      name: 'role',
      label: 'Role',
      value: selectedRole,
      onChange: setSelectedRole,
      options: [
        { value: 'All', label: 'All Roles' },
        { value: 'Administrator', label: 'Administrator' },
        { value: 'Moderator', label: 'Moderator' },
      ],
    },
  ];

  const displayLabels = {
    uFirstName: 'First Name',
    uLastName: 'Last Name',
    uEmail: 'Email',
    uPhoneNo: 'Phone Number',
    userGroup: 'Role',
    uGender: 'Gender',
    uCountry: 'Country',
  };

  // Filter logic for both search key and role
  const filteredUsers = users.filter((user) => {
    const searchInFields =
      `${user.uFirstName} ${user.uLastName} ${user.uEmail} ${user.uPhoneNo} ${user.userGroup}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const roleFilter =
      appliedFilters.role === 'All' || user.userGroup === appliedFilters.role;

    return searchInFields && roleFilter;
  });

  const handleAction = (action, user) => {
    if (action === 'view') {
      const essentialFields = {
        uFirstName: user.uFirstName || 'N/A',
        uLastName: user.uLastName || 'N/A',
        uEmail: user.uEmail || 'N/A',
        uPhoneNo: user.uPhoneNo || 'N/A',
        userGroup: user.userGroup || 'N/A',
        uGender: user.uGender || 'N/A',
        uCountry: user.uCountry || 'N/A',
      };
      setSelectedOperator(essentialFields);
    }
  };

  const operatorDropdownItems = [
    { label: 'View Operator', icon: <FaEye />, action: 'view' },
  ];

  const columns = [
    { header: 'First Name', accessor: 'uFirstName' },
    { header: 'Last Name', accessor: 'uLastName' },
    { header: 'Email', accessor: 'uEmail' },
    { header: 'Phone', accessor: 'uPhoneNo' },
    {
      header: 'Role',
      accessor: 'userGroup',
      render: (user) => (
        <span className={`role-badge ${user.userGroup.toLowerCase()}`}>
          {user.userGroup}
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
        <h1 className="dashboard-page-title">Operator Details</h1>
        <SearchBar
          value={searchKey}
          onChange={(newValue) => setSearchKey(newValue)}
          placeholder="Search operators..."
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

export default Operators;
