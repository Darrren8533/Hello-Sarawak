import React, { useState, useEffect } from 'react';
import { fetchModerators, suspendUser, activateUser, removeUser } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import ModeratorForm from '../../../../Component/ModeratorForm/ModeratorForm';
import Toast from '../../../../Component/Toast/Toast';
import Alert from '../../../../Component/Alert/Alert';
import { FaEye, FaBan, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import '../Moderators/Moderators.css';

const Moderators = () => {
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchKey, appliedFilters]);

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchUsers = async () => {
    try {
      const userData = await fetchModerators();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch moderator details', error);
      displayToast('error', 'Failed to load moderators. Please try again.');
    }
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
      await handleSuspendUser(user);
    } else if (action === 'activate') {
      await handleActivateUser(user);
    } else if (action === 'remove') {
      setUserToDelete(user);
      setIsDialogOpen(true);
    }
  };

  const handleSuspendUser = async (user) => {
    try {
      await suspendUser(user.userid);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.userid === user.userid ? { ...u, uactivation: 'Inactive' } : u))
      );
      displayToast('success', `User ${user.ufirstname} ${user.ulastname} has been suspended.`);
    } catch (error) {
      console.error('Failed to suspend user:', error);
      displayToast('error', 'Error suspending user');
    }
  };

  const handleActivateUser = async (user) => {
    try {
      await activateUser(user.userid);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.userid === user.userid ? { ...u, uactivation: 'Active' } : u))
      );
      displayToast('success', `User ${user.ufirstname} ${user.ulastname} has been activated.`);
    } catch (error) {
      console.error('Failed to activate user:', error);
      displayToast('error', 'Error activating user');
    }
  };

  const handleRemoveUser = async () => {
    try {
        await removeUser(userToDelete.userid);
        setUsers((prevUsers) => {
            // Remove the user from the list
            const updatedUsers = prevUsers.filter((u) => u.userid !== userToDelete.userid);
            setFilteredUsers(updatedUsers);
            return updatedUsers;
        });
        displayToast('success', `User ${userToDelete.ufirstname} ${userToDelete.ulastname} removed successfully.`);
    } catch (error) {
        console.error('Error removing user:', error);
        displayToast('error', 'Failed to remove user.');
    } finally {
        setIsDialogOpen(false);
        setUserToDelete(null);
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

      <PaginatedTable
        data={filteredUsers}
        columns={columns}
        rowKey="userid"
        enableCheckbox={false}
      />

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
            fetchUsers();
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
