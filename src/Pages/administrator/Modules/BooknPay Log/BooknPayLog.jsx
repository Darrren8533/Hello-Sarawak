import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import Filter from '../../../../Component/Filter/Filter';
import PaginatedTable from '../../../../Component/PaginatedTable/PaginatedTable';
import Modal from '../../../../Component/Modal/Modal';
import SearchBar from '../../../../Component/SearchBar/SearchBar';
import ActionDropdown from '../../../../Component/ActionDropdown/ActionDropdown'; // Ensure this is imported
import { fetchBookLog } from '../../../../../Api/api';
import '../../../../Component/MainContent/MainContent.css';
import '../../../../Component/ActionDropdown/ActionDropdown.css';
import '../../../../Component/Modal/Modal.css';
import '../../../../Component/Filter/Filter.css';
import '../../../../Component/SearchBar/SearchBar.css';

const BooknPayLog = () => {
  const [logs, setLogs] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ actionType: 'All' });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logData = await fetchBookLog();
        setLogs(logData || []); // Ensure logs is always an array
      } catch (error) {
        console.error('Failed to fetch Book & Pay Logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({ actionType: selectedActionType });
  };

  const filters = [
    {
      name: 'actionType',
      label: 'Action Type',
      value: selectedActionType,
      onChange: setSelectedActionType,
      options: [
        { value: 'All', label: 'All Actions' },
        { value: 'Request', label: 'Request' },
        { value: 'Payment', label: 'Payment' },
        { value: 'Modify', label: 'Modify' },
        { value: 'Remove', label: 'Remove' },
        { value: 'Checkout', label: 'Checkout' },
      ],
    },
  ];

  const displayLabels = {
    userid: 'UID',
    timestamp: 'Timestamp',
    action: 'Action',
  };

  const filteredLogs = logs.filter((log) => {
    const searchInFields = `${log.userid} ${log.action}`
      .toLowerCase()
      .includes(searchKey.toLowerCase());

    const actionFilter =
      appliedFilters.actionType === 'All' ||
      log.action.toLowerCase().includes(appliedFilters.actionType.toLowerCase());

    return searchInFields && actionFilter;
  });

  const handleAction = (action, log) => {
    if (action === 'view') {
      const essentialFields = {
        userid: log.userid || 'N/A',
        timestamp: log.timestamp || 'N/A',
        action: log.action || 'N/A',
      };
      setSelectedLog(essentialFields);
    }
  };

  const logDropdownItems = [
    { label: 'View Details', icon: <FaEye />, action: 'view' },
  ];

  const columns = [
    { header: 'UID', accessor: 'userid' },
    { header: 'Timestamp', accessor: 'timestamp' },
    { header: 'Action', accessor: 'action' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (log) => (
        <ActionDropdown
          items={logDropdownItems}
          onAction={(action) => handleAction(action, log)}
          onClose={() => {}}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="header-container">
        <h1 className="dashboard-page-title">Book & Pay Log</h1>
        <SearchBar
          value={searchKey}
          onChange={(newValue) => setSearchKey(newValue)}
          placeholder="Search logs..."
        />
      </div>

      <Filter filters={filters} onApplyFilters={handleApplyFilters} />

      <PaginatedTable
        data={filteredLogs}
        columns={columns}
        rowKey={(log) => `${log.timestamp}-${log.userid}`} // Unique key
        enableCheckbox={false}
      />

      <Modal
        isOpen={!!selectedLog}
        title="Log Details"
        data={selectedLog || {}}
        labels={displayLabels}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default BooknPayLog;
