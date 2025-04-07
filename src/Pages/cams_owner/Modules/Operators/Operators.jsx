import React, { useState, useEffect } from 'react';
import { fetchOperators } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import { FaEye, FaBan, FaUserTag } from 'react-icons/fa';
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
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleOperator, setRoleOperator] = useState(null);
  const [selectedAssignRole, setSelectedAssignRole] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;
  
  const roles = ['Customer', 'Moderator', 'Administrator'];

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
    ufirstname: 'First Name',
    ulastname: 'Last Name',
    uemail: 'Email',
    uphoneno: 'Phone Number',
    usergroup: 'Role',
    ugender: 'Gender',
    ucountry: 'Country',
  };

  // Filter logic for both search key and role
  const filteredUsers = users.filter((user) => {
    const searchInFields =
      `${user.ufirstname} ${user.ulastname} ${user.uemail} ${user.uphoneno} ${user.usergroup}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const roleFilter =
      appliedFilters.role === 'All' || user.usergroup === appliedFilters.role;

    return searchInFields && roleFilter;
  });

  const handleAction = (action, user) => {
    if (action === 'view') {
      const essentialFields = {
        ufirstname: user.ufirstname || 'N/A',
        ulastname: user.ulastname || 'N/A',
        uemail: user.uemail || 'N/A',
        uphoneno: user.uphoneno || 'N/A',
        usergroup: user.usergroup || 'N/A',
        ugender: user.ugender || 'N/A',
        ucountry: user.ucountry || 'N/A',
      };
      setSelectedOperator(essentialFields);
    } else if (action === 'assignRole') {
      setRoleOperator(user);
      setSelectedAssignRole(user.usergroup || 'Moderator');
      setShowRoleModal(true);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedAssignRole(e.target.value);
  };

  const handleRoleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/users/assignRole`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: roleOperator.userid,
          role: selectedAssignRole
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setUsers(users.map(user => 
          user.userid === roleOperator.userid 
            ? {...user, usergroup: selectedAssignRole} 
            : user
        ));
        setShowRoleModal(false);
      } else {
        console.error('Failed to assign role:', data.message);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const operatorDropdownItems = [
    { label: 'View Operator', icon: <FaEye />, action: 'view' },
    { label: 'Assign Role', icon: <FaUserTag />, action: 'assignRole' },
  ];

  const columns = [
    { header: 'First Name', accessor: 'ufirstname' },
    { header: 'Last Name', accessor: 'ulastname' },
    { header: 'Email', accessor: 'uemail' },
    { header: 'Phone', accessor: 'uphoneno' },
    {
      header: 'Role',
      accessor: 'usergroup',
      render: (user) => (
        <span className={`role-badge ${user.usergroup.toLowerCase()}`}>
          {user.usergroup}
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
        rowKey="userid"
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedOperator}
        title={`${selectedOperator?.ufirstname} ${selectedOperator?.ulastname}`}
        data={selectedOperator || {}}
        labels={displayLabels}
        onClose={() => setSelectedOperator(null)}
      />
      
      {/* Role Assignment Modal */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Assign Role to {roleOperator?.ufirstname} {roleOperator?.ulastname}</h2>
              <button className="close-button" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="role" className="role-label">Select Role:</label>
                <select 
                  id="role" 
                  value={selectedAssignRole} 
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

export default Operators;
