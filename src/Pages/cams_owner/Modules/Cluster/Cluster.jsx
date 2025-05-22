import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchClusters, 
  fetchClusterNames, 
  addCluster, 
  updateCluster, 
  deleteCluster 
} from '../../../../../Api/api';
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
  const [states, setStates] = useState([]);

  const displayToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const resetForm = useCallback(() => {
    setNewCluster({
      clusterName: '',
      clusterState: '',
      clusterProvince: ''
    });
    setEditMode(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewCluster(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  
  const handleSearchChange = useCallback((newValue) => {
    // 直接更新状态，不再使用防抖
    setSearchKey(newValue);
  }, []);

  const handleDeleteCluster = useCallback(async (clusterID) => {
    try {
      const data = await deleteCluster(clusterID);
      
      if (data.success) {
        setClusters(clusters.filter(cluster => cluster.clusterid !== clusterID));
        displayToast('success', 'Successfully deleted cluster');
      } else {
        displayToast('error', `Failed to delete: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting cluster:', error);
      displayToast('error', 'Error deleting cluster. Please try again.');
    }
  }, [clusters, setClusters, displayToast]);

  const handleAction = useCallback((action, cluster) => {
    if (action === 'view') {
      setSelectedCluster(cluster);
    } else if (action === 'edit') {
      setNewCluster({
        clusterID: cluster.clusterid,
        clusterName: cluster.clustername,
        clusterState: cluster.clusterstate,
        clusterProvince: cluster.clusterprovince
      });
      setEditMode(true);
      setShowAddModal(true);
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${cluster.clustername}?`)) {
        handleDeleteCluster(cluster.clusterid);
      }
    }
  }, [setSelectedCluster, setNewCluster, setEditMode, setShowAddModal, handleDeleteCluster]);

  const handleAddCluster = useCallback(async () => {
    try {
      const clusterData = {
        clusterName: newCluster.clusterName,
        clusterState: newCluster.clusterState,
        clusterProvince: newCluster.clusterProvince
      };
      
      let data;
      
      if (editMode) {
        data = await updateCluster(newCluster.clusterID, clusterData);
      } else {
        data = await addCluster(clusterData);
      }
      
      if (data.success) {
        if (editMode) {
          setClusters(clusters.map(cluster => 
            cluster.clusterid === newCluster.clusterID 
              ? { 
                  ...cluster,
                  clustername: newCluster.clusterName,
                  clusterstate: newCluster.clusterState,
                  clusterprovince: newCluster.clusterProvince
                } 
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
  }, [clusters, editMode, newCluster, setShowAddModal, displayToast, resetForm, setClusters]);

  const handleApplyFilters = () => {
    setAppliedFilters({ state: selectedState });
  };

  // Fetch clusters and cluster states from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clusters
        const clusterData = await fetchClusters();
        setClusters(clusterData);
        
        // Fetch unique cluster names
        const namesData = await fetchClusterNames();
        setStates(namesData);
      } catch (error) {
        console.error('Failed to fetch data', error);
        displayToast('error', 'Failed to load data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const filters = [
    {
      name: 'state',
      label: 'Cluster Name',
      value: selectedState,
      onChange: setSelectedState,
      options: [
        { value: 'All', label: 'All Cluster Names' },
        ...states.map(state => (
          typeof state === 'string' 
            ? { value: state, label: state } 
            : { value: state.clustername, label: state.clustername }
        ))
      ],
    },
  ];

  const displayLabels = {
    clusterid: 'ID',
    clustername: 'Name',
    clusterstate: 'State',
    clusterprovince: 'Province',
    timestamp: 'Created At'
  };

  const filteredClusters = clusters.filter((cluster) => {
    const searchInFields =
      `${cluster.clustername} ${cluster.clusterstate} ${cluster.clusterprovince}`
        .toLowerCase()
        .includes(searchKey.toLowerCase());

    const stateFilter =
      appliedFilters.state === 'All' || cluster.clustername === appliedFilters.state;

    return searchInFields && stateFilter;
  });

  const clusterDropdownItems = [
    { label: 'View Details', icon: <FaEye />, action: 'view' },
    { label: 'Edit Cluster', icon: <FaEdit />, action: 'edit' },
    { label: 'Delete Cluster', icon: <FaTrash />, action: 'delete' },
  ];

  const columns = [
    { header: 'ID', accessor: 'clusterid' },
    { header: 'Name', accessor: 'clustername' },
    { header: 'State', accessor: 'clusterstate' },
    { header: 'Province', accessor: 'clusterprovince' },
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

  const AddClusterModal = React.memo(({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    const [localFormData, setLocalFormData] = useState(() => ({
      clusterName: newCluster.clusterName,
      clusterState: newCluster.clusterState,
      clusterProvince: newCluster.clusterProvince
    }));
    
    useEffect(() => {
      if (isOpen) {
        setLocalFormData({
          clusterName: newCluster.clusterName,
          clusterState: newCluster.clusterState,
          clusterProvince: newCluster.clusterProvince
        });
      }
    }, [isOpen, newCluster]);
    
    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setLocalFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    const handleSubmit = () => {
      const submitData = async () => {
        try {
          const clusterData = {
            clusterName: localFormData.clusterName,
            clusterState: localFormData.clusterState,
            clusterProvince: localFormData.clusterProvince
          };
          
          let data;
          
          if (editMode) {
            data = await updateCluster(newCluster.clusterID, clusterData);
          } else {
            data = await addCluster(clusterData);
          }
          
          if (data.success) {
            if (editMode) {
              setClusters(clusters.map(cluster => 
                cluster.clusterid === newCluster.clusterID 
                  ? { 
                      ...cluster,
                      clustername: localFormData.clusterName,
                      clusterstate: localFormData.clusterState,
                      clusterprovince: localFormData.clusterProvince
                    } 
                  : cluster
              ));
              displayToast('success', `Successfully updated ${localFormData.clusterName}`);
            } else {
              setClusters([...clusters, data.cluster]);
              displayToast('success', `Successfully added ${localFormData.clusterName}`);
            }
            onClose();
            resetForm();
          } else {
            displayToast('error', `Failed: ${data.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`Error ${editMode ? 'updating' : 'adding'} cluster:`, error);
          displayToast('error', `Error ${editMode ? 'updating' : 'adding'} cluster. Please try again.`);
        }
      };
      
      submitData();
    };
    
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
                value={localFormData.clusterName}
                onChange={handleLocalChange}
                placeholder="Enter cluster name"
                autoComplete="off"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="clusterState">State</label>
             
              <input
                type="text"
                id="clusterState"
                name="clusterState"
                value={localFormData.clusterState}
                onChange={handleLocalChange}
                placeholder="Enter cluster state"
                required
                autoComplete="off"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="clusterProvince">Province</label>
              <input
                type="text"
                id="clusterProvince"
                name="clusterProvince"
                value={localFormData.clusterProvince}
                onChange={handleLocalChange}
                placeholder="Enter province"
                required
                autoComplete="off"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <div className="button-group">
              <button className="cancel-button" onClick={onClose}>Cancel</button>
              <button 
                className="submit-button"
                onClick={handleSubmit}
                disabled={!localFormData.clusterName || !localFormData.clusterState || !localFormData.clusterProvince}
              >
                {editMode ? 'Update Cluster' : 'Add Cluster'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div>
      {showToast && <Toast type={toastType} message={toastMessage} />}
      
      <div className="header-container">
        <h1 className="dashboard-page-title">Cluster Management</h1>
        <div className="header-actions">
          <SearchBar
            value={searchKey}
            onChange={handleSearchChange}
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
        rowKey="clusterid"
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedCluster}
        title={selectedCluster?.clustername || 'Cluster Details'}
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
