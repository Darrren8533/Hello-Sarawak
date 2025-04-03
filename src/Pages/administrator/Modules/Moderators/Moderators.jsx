import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchModerators, suspendUser, activateUser, removeUser } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import ModeratorForm from '../../../../Component/ModeratorForm/ModeratorForm';
import Toast from '../../../../Component/Toast/Toast';
import Alert from '../../../../Component/Alert/Alert';
import Loader from '../../../../Component/Loader/Loader';
import { FaEye, FaBan, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import '../Moderators/Moderators.css';

const Moderators = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isModeratorFormOpen, setIsModeratorFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Initialize QueryClient
  const queryClient = useQueryClient();

  // Fetch moderators query
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['moderators'],
    queryFn: fetchModerators,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 1000,
  });

  // Define mutations
  const suspendMutation = useMutation({
    mutationFn: (userId) => suspendUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['moderators'], (oldData) =>
        oldData.map(u => u.userid === userId ? { ...u, uactivation: 'Inactive' } : u)
      );
      const user = users.find(u => u.userid === userId);
      displayToast('success', `User ${user.ufirstname} ${user.ulastname} has been suspended.`);
    },
    onError: (error) => {
      console.error('Failed to suspend user:', error);
      displayToast('error', 'Error suspending user');
    }
  });

  const activateMutation = useMutation({
    mutationFn: (userId) => activateUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['moderators'], (oldData) =>
        oldData.map(u => u.userid === userId ? { ...u, uactivation: 'Active' } : u)
      );
      const user = users.find(u => u.userid === userId);
      displayToast('success', `User ${user.ufirstname} ${user.ulastname} has been activated.`);
    },
    onError: (error) => {
      console.error('Failed to activate user:', error);
      displayToast('error', 'Error activating user');
    }
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => removeUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['moderators'], (oldData) =>
        oldData.filter(u => u.userid !== userId)
      );
      const user = users.find(u => u.userid === userId);
      displayToast('success', `User ${user.ufirstname} ${user.ulastname} removed successfully.`);
      setIsDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      console.error('Error removing user:', error);
      displayToast('error', 'Failed to remove user.');
      setIsDialogOpen(false);
      setUserToDelete(null);
    }
  });

  useEffect(() => {
    applyFilters();
  }, [users, searchKey, appliedFilters]);

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const applyFilters = () => {
    const filtered = users.filter(
      (user) =>
        (appliedFilters.status === 'All' || (user.uactivation ?? 'Active').toLowerCase() === appliedFilters.status.toLowerCase()) &&
        (
          (user.userid?.toString().includes(searchKey.toLowerCase()) || '') ||
          (user.ufirstname?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (user.ulastname?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (user.uemail?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (user.uphoneno?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (user.uactivation?.toLowerCase().includes(searchKey.toLowerCase()) || '')
        )
    );
    setFilteredUsers(filtered);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ status: selectedStatus });
  };

  const handleCreateModerator = () => {
    setEditUser(null);
    setIsModeratorFormOpen(true);
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
    ufirstname: 'First Name',
    ulastname: 'Last Name',
    uemail: 'Email',
    uphoneno: 'Phone Number',
    uactivation: 'Status',
    ugender: 'Gender',
    ucountry: 'Country'
  };

  const handleAction = async (action, user) => {
    if (action === 'view') {
      setSelectedUser({
        ufirstname: user.ufirstname || 'N/A',
        ulastname: user.ulastname || 'N/A',
        uemail: user.uemail || 'N/A',
        uphoneno: user.uphoneno || 'N/A',
        uactivation: user.uactivation,
        ugender: user.ugender || 'N/A',
        ucountry: user.ucountry || 'N/A',
      });
    } else if (action === 'edit') {
      setEditUser(user);
      setIsModeratorFormOpen(true);
    } else if (action === 'suspend') {
      suspendMutation.mutate(user.userid);
    } else if (action === 'activate') {
      activateMutation.mutate(user.userid);
    } else if (action === 'remove') {
      setUserToDelete(user);
      setIsDialogOpen(true);
    }
  };

  const handleRemoveUser = () => {
    if (userToDelete) {
      removeMutation.mutate(userToDelete.userid);
    }
  };

  const userDropdownItems = (userStatus) => {
    if (userStatus === 'Inactive') {
      return [
        { label: 'View Moderator', icon: <FaEye />, action: 'view' },
        { label: 'Edit', icon: <FaEdit />, action: 'edit' },
        { label: 'Activate', icon: <FaUser />, action: 'activate' },
        { label: 'Remove', icon: <FaTrash />, action: 'remove' },
      ];
    } else if (userStatus === 'Active') {
      return [
        { label: 'View Moderator', icon: <FaEye />, action: 'view' },
        { label: 'Edit', icon: <FaEdit />, action: 'edit' },
        { label: 'Suspend', icon: <FaBan />, action: 'suspend' },
      ];
    }

    return [{ label: 'View Moderator', icon: <FaEye />, action: 'view' }];
  };

  const columns = [
    { header: 'ID', accessor: 'userid' },
    { header: 'First Name', accessor: 'ufirstname' },
    { header: 'Last Name', accessor: 'ulastname' },
    { header: 'Email', accessor: 'uemail' },
    { header: 'Phone', accessor: 'uphoneno' },
    {
      header: 'Status',
      accessor: 'uactivation',
      render: (user) => (
        <span className={`status-badge ${(user.uactivation || 'Active').toLowerCase()}`}>
          {user.uactivation || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (user) => (
        <ActionDropdown
          items={userDropdownItems(user.uactivation)} 
          onAction={(action) => handleAction(action, user)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Moderator Details</h1>
        <SearchBar value={searchKey} onChange={(newValue) => setSearchKey(newValue)} placeholder="Search moderators..." />
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />
      <button className="create-moderator-button" onClick={handleCreateModerator}>Create Moderator</button>

      {isLoading ? (
        <div className="loader-box">
          <Loader />
        </div>
      ) : (
        <PaginatedTable
          data={filteredUsers}
          columns={columns}
          rowKey="userid"
          enableCheckbox={false}
        />
      )}

      <Modal
        isOpen={!!selectedUser}
        title={`${selectedUser?.ufirstname} ${selectedUser?.ulastname}`}
        data={selectedUser || {}}
        labels={displayLabels}
        onClose={() => setSelectedUser(null)}
      />

      {isModeratorFormOpen && (
        <ModeratorForm
          initialData={editUser}
          onSubmit={() => {
            setIsModeratorFormOpen(false);
            queryClient.invalidateQueries(['moderators']);
            displayToast('success', editUser ? 'Moderator updated successfully!' : 'Moderator created successfully!');
          }}
          onClose={() => setIsModeratorFormOpen(false)}
        />
      )}

      <Alert
        isOpen={isDialogOpen}
        title="Confirm Remove"
        message={`Are you sure you want to remove Moderator ${userToDelete?.ufirstname} ${userToDelete?.ulastname}?`}
        onConfirm={handleRemoveUser}
        onCancel={() => setIsDialogOpen(false)}
      />

      {showToast && <Toast type={toastType} message={toastMessage} />}
    </div>
  );
};

export default Moderators;