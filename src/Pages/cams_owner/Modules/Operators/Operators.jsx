import React, { useState } from 'react';
import { fetchOperators } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import Role from '../../../../Component/Role/Role';
import RoleManager from '../../../../Component/RoleManager/RoleManager';
import UserActivityCell from '../../../../Component/UserActivityCell/UserActivityCell';
import Alert from '../../../../Component/Alert/Alert';
import { FaEye, FaUserTag } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import '../Operators/Operators.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Loader from '../../../../Component/Loader/Loader';


const Operators = () => {
  const [searchKey, setSearchKey] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ role: 'All' });
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleOperator, setRoleOperator] = useState(null);
  const [selectedAssignRole, setSelectedAssignRole] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;
  
  const queryClient = useQueryClient();
  const roles = ['Customer', 'Moderator', 'Administrator'];

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Fetch operators with TanStack Query
  const { 
    data: operators = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      try {
        return await fetchOperators();
      } catch (error) {
        throw new Error('Failed to fetch operator details');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      displayToast('error', `Failed to fetch operators: ${error.message}`);
    }
  });

  // Role assignment mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const response = await fetch(`${API_URL}/users/assignRole`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userId,
          role: role
        }),
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to assign role');
      }
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      setShowRoleModal(false);
      displayToast(
        'success', 
        `Successfully assigned ${variables.role} role to ${roleOperator.username}`
      );
    },
    onError: (error) => {
      displayToast('error', `Error assigning role: ${error.message}`);
    }
  });

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

  const filteredOperators = operators.filter((operator) => {
    const searchInFields =
      `${operator.ufirstname || ''} ${operator.ulastname || ''} ${operator.uemail || ''} ${operator.uphoneno || ''} ${operator.usergroup || ''}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const roleFilter =
      appliedFilters.role === 'All' || operator.usergroup === appliedFilters.role;

    return searchInFields && roleFilter;
  });

  const handleAction = (action, operator) => {
    if (action === 'view') {
      const essentialFields = {
        ufirstname: operator.ufirstname || 'N/A',
        ulastname: operator.ulastname || 'N/A',
        uemail: operator.uemail || 'N/A',
        uphoneno: operator.uphoneno || 'N/A',
        usergroup: operator.usergroup || 'N/A',
        ugender: operator.ugender || 'N/A',
        ucountry: operator.ucountry || 'N/A',
      };
      setSelectedOperator(essentialFields);
    } else if (action === 'assignRole') {
      setRoleOperator(operator);
      setSelectedAssignRole(operator.usergroup || 'Moderator'); 
      setShowRoleModal(true);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedAssignRole(e.target.value);
  };

  const handleRoleSubmit = () => {
    if (!roleOperator || !selectedAssignRole) return;
    
    assignRoleMutation.mutate({
      userId: roleOperator.userid,
      role: selectedAssignRole
    });
  };

  const operatorDropdownItems = [
    { label: 'View Operator', icon: <FaEye />, action: 'view' },
    { label: 'Assign Role', icon: <FaUserTag />, action: 'assignRole' },
  ];

  const columns = [
    { header: 'ID', accessor: 'userid' },
    {
      header: 'Operator',
      accessor: 'operator',
      render: (operator) => (
        <UserActivityCell user={operator} />
      ),
    },
    { header: 'Email', accessor: 'uemail' },
    {
      header: 'Role',
      accessor: 'usergroup',
      render: (operator) => (
        <Role role={operator.usergroup || 'Operator'} />
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
      {showToast && <Toast type={toastType} message={toastMessage} />}
      
      <div className="header-container">
        <h1 className="dashboard-page-title">Operator Details</h1>
        <SearchBar
          value={searchKey}
          onChange={(newValue) => setSearchKey(newValue)}
          placeholder="Search operators..."
        />
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />

      {isLoading && <div className="loader-box">
        <Loader />
      </div>}
      
      {isError && (
        <Alert type="error" message={`Error: ${error.message || 'Failed to load operators'}`} />
      )}

      {!isLoading && !isError && (
        <PaginatedTable
          data={filteredOperators}
          columns={columns}
          rowKey="userid"
          enableCheckbox={false}
        />
      )}

      <Modal
        isOpen={!!selectedOperator}
        title={`${selectedOperator?.ufirstname} ${selectedOperator?.ulastname}`}
        data={selectedOperator || {}}
        labels={displayLabels}
        onClose={() => setSelectedOperator(null)}
      />
      
      <RoleManager
        isOpen={showRoleModal}
        user={roleOperator}
        roles={roles}
        selectedRole={selectedAssignRole} 
        onRoleChange={handleRoleChange}
        onSubmit={handleRoleSubmit}
        onClose={() => setShowRoleModal(false)}
        isLoading={assignRoleMutation.isPending}
      />
    </div>
  );
};

export default Operators;