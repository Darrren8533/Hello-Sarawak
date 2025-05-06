import React, { useState, useEffect } from 'react';
import { fetchClusters } from '../../../../../Api/api';
import Filter from '../../../../Component/Filter/Filter';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Toast from '../../../../Component/Toast/Toast';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';
import './Cluster.css';

const Cluster = () => {
  const [clusters, setClusters] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ state: 'All' });
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCluster, setNewCluster] = useState({
    clusterName: '',
    clusterState: '',
    clusterProvince: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  // Sarawak states
  const states = [
    'Kuching',
    'Miri',
    'Sibu',
    'Bintulu',
    'Limbang',
    'Sarikei',
    'Sri Aman',
    'Kapit',
    'Mukah',
    'Betong',
    'Samarahan',
    'Serian'
  ];

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        const clusterData = await fetchClusters();
        setClusters(clusterData);
      } catch (error) {
        console.error('Failed to fetch cluster details', error);
        displayToast('error', 'Failed to load clusters. Please try again.');
      }
    };
    fetchClusterData();
  }, []);

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ state: selectedState });
  };

  const filters = [
    {
      name: 'state',
      label: 'State',
      value: selectedState,
      onChange: setSelectedState,
      options: [
        { value: 'All', label: 'All States' },
        ...states.map(state => ({ value: state, label: state }))
      ],
    },
  ];

  const displayLabels = {
    clusterID: 'ID',
    clusterName: 'Name',
    clusterState: 'State',
    clusterProvince: 'Province',
    timestamp: 'Created At'
  };

  const filteredClusters = clusters.filter((cluster) => {
    const searchInFields =
      `${cluster.clusterName} ${cluster.clusterState} ${cluster.clusterProvince}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const stateFilter =
      appliedFilters.state === 'All' || cluster.clusterState === appliedFilters.state;

    return searchInFields && stateFilter;
  });

  const handleAction = (action, cluster) => {
    if (action === 'view') {
      setSelectedCluster(cluster);
    } else if (action === 'edit') {
      setNewCluster({
        clusterID: cluster.clusterID,
        clusterName: cluster.clusterName,
        clusterState: cluster.clusterState,
        clusterProvince: cluster.clusterProvince
      });
      setEditMode(true);
      setShowAddModal(true);
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${cluster.clusterName}?`)) {
        handleDeleteCluster(cluster.clusterID);
      }
    }
  };

  const handleAddCluster = async () => {
    try {
      const endpoint = editMode 
        ? `${API_URL}/clusters/${newCluster.clusterID}` 
        : `${API_URL}/clusters`;
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCluster),
      });

      const data = await response.json();
      
      if (data.success) {
        if (editMode) {
          setClusters(clusters.map(cluster => 
            cluster.clusterID === newCluster.clusterID 
              ? { ...newCluster, timestamp: cluster.timestamp } 
              : cluster
          ));
          displayToast('success', `Successfully updated ${newCluster.clusterName}`);
        } else {
          setClusters([...clusters, data.cluster]);
          displayToast('success', `Successfully added ${newCluster.clusterName}`);
        }
        setShowAddModal(false);
        resetForm();
      } else {
        displayToast('error', `Failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} cluster:`, error);
      displayToast('error', `Error ${editMode ? 'updating' : 'adding'} cluster. Please try again.`);
    }
  };

  const handleDeleteCluster = async (clusterID) => {
    try {
      const response = await fetch(`${API_URL}/clusters/${clusterID}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setClusters(clusters.filter(cluster => cluster.clusterID !== clusterID));
        displayToast('success', 'Successfully deleted cluster');
      } else {
        displayToast('error', `Failed to delete: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting cluster:', error);
      displayToast('error', 'Error deleting cluster. Please try again.');
    }
  };

  const resetForm = () => {
    setNewCluster({
      clusterName: '',
      clusterState: '',
      clusterProvince: ''
    });
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCluster(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clusterDropdownItems = [
    { label: 'View Details', icon: <FaEye />, action: 'view' },
    { label: 'Edit Cluster', icon: <FaEdit />, action: 'edit' },
    { label: 'Delete Cluster', icon: <FaTrash />, action: 'delete' },
  ];

  const columns = [
    { header: 'ID', accessor: 'clusterID' },
    { header: 'Name', accessor: 'clusterName' },
    { header: 'State', accessor: 'clusterState' },
    { header: 'Province', accessor: 'clusterProvince' },
    { 
      header: 'Created At', 
      accessor: 'timestamp',
      render: (cluster) => {
        const date = new Date(cluster.timestamp);
        return isNaN(date) ? 'N/A' : date.toLocaleString();
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (cluster) => (
        <ActionDropdown
          items={clusterDropdownItems}
          onAction={(action) => handleAction(action, cluster)}
          onClose={() => {}}
        />
      ),
    },
  ];

  const AddClusterModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-container cluster-form-modal">
          <div className="modal-header">
            <h2>{editMode ? 'Edit Cluster' : 'Add New Cluster'}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="clusterName">Cluster Name</label>
              <input
                type="text"
                id="clusterName"
                name="clusterName"
                value={newCluster.clusterName}
                onChange={handleInputChange}
                placeholder="Enter cluster name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="clusterState">State</label>
              <select
                id="clusterState"
                name="clusterState"
                value={newCluster.clusterState}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a state</option>
                {states.map((state, index) => (
                  <option key={index} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="clusterProvince">Province</label>
              <input
                type="text"
                id="clusterProvince"
                name="clusterProvince"
                value={newCluster.clusterProvince}
                onChange={handleInputChange}
                placeholder="Enter province"
                required
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <div className="button-group">
              <button className="cancel-button" onClick={onClose}>Cancel</button>
              <button 
                className="submit-button"
                onClick={handleAddCluster}
                disabled={!newCluster.clusterName || !newCluster.clusterState || !newCluster.clusterProvince}
              >
                {editMode ? 'Update Cluster' : 'Add Cluster'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {showToast && <Toast type={toastType} message={toastMessage} />}
      
      <div className="header-container">
        <h1 className="dashboard-page-title">Cluster Management</h1>
        <div className="header-actions">
          <SearchBar
            value={searchKey}
            onChange={(newValue) => setSearchKey(newValue)}
            placeholder="Search clusters..."
          />
          <button 
            className="add-button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Add New Cluster
          </button>
        </div>
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />

      <PaginatedTable
        data={filteredClusters}
        columns={columns}
        rowKey="clusterID"
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedCluster}
        title={selectedCluster?.clusterName || 'Cluster Details'}
        data={selectedCluster || {}}
        labels={displayLabels}
        onClose={() => setSelectedCluster(null)}
      />
      
      <AddClusterModal 
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }} 
      />
    </div>
  );
};

export default Cluster;
