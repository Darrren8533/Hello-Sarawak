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
  const [filteredModerators, setFilteredModerators] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ status: 'All' });
  const [selectedModerator, setSelectedModerator] = useState(null);
  const [editModerator, setEditModerator] = useState(null);
  const [isModeratorFormOpen, setIsModeratorFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [moderatorToDelete, setModeratorToDelete] = useState(null);

  // Initialize QueryClient
  const queryClient = useQueryClient();

  // Fetch moderators query
  const { data: moderators = [], isLoading } = useQuery({
    queryKey: ['moderators'],
    queryFn: fetchModerators,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 1000,
  });

  // Define mutations
  const suspendMutation = useMutation({
    mutationFn: (moderatorId) => suspendUser(moderatorId),
    onSuccess: (_, moderatorId) => {
      queryClient.setQueryData(['moderators'], (oldData) =>
        oldData.map(m => m.userid === moderatorId ? { ...m, uactivation: 'Inactive' } : m)
      );
      const moderator = moderators.find(m => m.userid === moderatorId);
      displayToast('success', `Moderator ${moderator.ufirstname} ${moderator.ulastname} has been suspended.`);
    },
    onError: (error) => {
      console.error('Failed to suspend moderator:', error);
      displayToast('error', 'Error suspending moderator');
    }
  });

  const activateMutation = useMutation({
    mutationFn: (moderatorId) => activateUser(moderatorId),
    onSuccess: (_, moderatorId) => {
      queryClient.setQueryData(['moderators'], (oldData) =>
        oldData.map(m => m.userid === moderatorId ? { ...m, uactivation: 'Active' } : m)
      );
      const moderator = moderators.find(m => m.userid === moderatorId);
      displayToast('success', `Moderator ${moderator.ufirstname} ${moderator.ulastname} has been activated.`);
    },
    onError: (error) => {
      console.error('Failed to activate moderator:', error);
      displayToast('error', 'Error activating moderator');
    }
  });

  const removeMutation = useMutation({
    mutationFn: (moderatorId) => removeUser(moderatorId),
    onSuccess: (_, moderatorId) => {
      queryClient.setQueryData(['moderators'], (oldData) =>
        oldData.filter(m => m.userid !== moderatorId)
      );
      const moderator = moderators.find(m => m.userid === moderatorId);
      displayToast('success', `Moderator ${moderator.ufirstname} ${moderator.ulastname} removed successfully.`);
      setIsDialogOpen(false);
      setModeratorToDelete(null);
    },
    onError: (error) => {
      console.error('Error removing moderator:', error);
      displayToast('error', 'Failed to remove moderator.');
      setIsDialogOpen(false);
      setModeratorToDelete(null);
    }
  });

  useEffect(() => {
    applyFilters();
  }, [moderators, searchKey, appliedFilters]);

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const applyFilters = () => {
    const filtered = moderators.filter(
      (moderator) =>
        (appliedFilters.status === 'All' || (moderator.uactivation ?? 'Active').toLowerCase() === appliedFilters.status.toLowerCase()) &&
        (
          (moderator.userid?.toString().includes(searchKey.toLowerCase()) || '') ||
          (moderator.ufirstname?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (moderator.ulastname?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (moderator.uemail?.toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (moderator.uphoneno?.toString().toLowerCase().includes(searchKey.toLowerCase()) || '') ||
          (moderator.uactivation?.toLowerCase().includes(searchKey.toLowerCase()) || '')
        )
    );
    setFilteredModerators(filtered);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ status: selectedStatus });
  };

  const handleCreateModerator = () => {
    setEditModerator(null);
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

  const handleAction = async (action, moderator) => {
    if (action === 'view') {
      setSelectedModerator({
        ufirstname: moderator.ufirstname || 'N/A',
        ulastname: moderator.ulastname || 'N/A',
        uemail: moderator.uemail || 'N/A',
        uphoneno: moderator.uphoneno || 'N/A',
        uactivation: moderator.uactivation,
        ugender: moderator.ugender || 'N/A',
        ucountry: moderator.ucountry || 'N/A',
      });
    } else if (action === 'edit') {
      setEditModerator(moderator);
      setIsModeratorFormOpen(true);
    } else if (action === 'suspend') {
      suspendMutation.mutate(moderator.userid);
    } else if (action === 'activate') {
      activateMutation.mutate(moderator.userid);
    } else if (action === 'remove') {
      setModeratorToDelete(moderator);
      setIsDialogOpen(true);
    }
  };

  const handleRemoveModerator = () => {
    if (moderatorToDelete) {
      removeMutation.mutate(moderatorToDelete.userid);
    }
  };

  const moderatorDropdownItems = (moderatorStatus) => {
    if (moderatorStatus === 'Inactive') {
      return [
        { label: 'View Moderator', icon: <FaEye />, action: 'view' },
        { label: 'Edit', icon: <FaEdit />, action: 'edit' },
        { label: 'Activate', icon: <FaUser />, action: 'activate' },
        { label: 'Remove', icon: <FaTrash />, action: 'remove' },
      ];
    } else if (moderatorStatus === 'Active') {
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
    {
      header: 'Moderator',
      accessor: 'moderator',
      render: (moderator) => (
        <div className="user-container">
          <div className="avatar-container">
            {moderator.uimage && moderator.uimage.length > 0 ? (
              <img
                src={`data:image/jpeg;base64,${moderator.uimage}`}
                alt={moderator.username || 'Avatar'}
                className="table-user-avatar"
                onError={(e) => {
                  console.error(`Failed to load avatar for moderator ${moderator.userid}:`, moderator.uimage);
                  e.target.src = '/public/avatar.png';
                }}
              />
            ) : (
              <img
                src="/public/avatar.png"
                alt={moderator.username || 'Avatar'}
                className="table-user-avatar"
              />
            )}
            <span
              className={`status-dot ${
                moderator.ustatus === 'login' ? 'status-login' :
                moderator.ustatus === 'registered' ? 'status-registered' :
                'status-logout'
              }`}
            />
          </div>
         <span className="table-user-username">{moderator.username || 'N/A'}</span>
        </div>
      ),
    },
    { header: 'Email', accessor: 'uemail' },
    {
      header: 'Status',
      accessor: 'uactivation',
      render: (moderator) => (
        <span className={`status-badge ${(moderator.uactivation || 'Active').toLowerCase()}`}>
          {moderator.uactivation || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (moderator) => (
        <ActionDropdown
          items={moderatorDropdownItems(moderator.uactivation)} 
          onAction={(action) => handleAction(action, moderator)}
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
          data={filteredModerators}
          columns={columns}
          rowKey="userid"
          enableCheckbox={false}
        />
      )}

      <Modal
        isOpen={!!selectedModerator}
        title={`${selectedModerator?.ufirstname} ${selectedModerator?.ulastname}`}
        data={selectedModerator || {}}
        labels={displayLabels}
        onClose={() => setSelectedModerator(null)}
      />

      {isModeratorFormOpen && (
        <ModeratorForm
          initialData={editModerator}
          onSubmit={() => {
            setIsModeratorFormOpen(false);
            queryClient.invalidateQueries(['moderators']);
            displayToast('success', editModerator ? 'Moderator updated successfully!' : 'Moderator created successfully!');
          }}
          onClose={() => setIsModeratorFormOpen(false)}
        />
      )}

      <Alert
        isOpen={isDialogOpen}
        title="Confirm Remove"
        message={`Are you sure you want to remove Moderator ${moderatorToDelete?.ufirstname} ${moderatorToDelete?.ulastname}?`}
        onConfirm={handleRemoveModerator}
        onCancel={() => setIsDialogOpen(false)}
      />

      {showToast && <Toast type={toastType} message={toastMessage} />}
    </div>
  );
};

export default Moderators;
