import { useState, useEffect } from 'react';
import { Search, Download, Mail, UserPlus,  X, ChevronDown, Edit, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { fetchUsers, updateUserRole, updateUserBatches, deleteUser, sendInvitation, sendBulkEmails, fetchBatches, createBatch, updateBatch, deleteBatch } from '../../services/api';
import { User, Batch } from '../../types/user';

// Define roles array
const ROLES = ['Super Admin', 'Admin', 'Mentor', 'Student'] as const;

// Main Admin Dashboard Component
const UserManagement = () => {
  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  // const [roles, setRoles] = useState(['Super Admin', 'Admin', 'Mentor', 'Student']);
  const [newBatchName, setNewBatchName] = useState('');
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [editBatchName, setEditBatchName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [batchDescription, setBatchDescription] = useState('');
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Add these state variables for role modal
  const [newRole, setNewRole] = useState('');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  // Add these state variables at the top with other state declarations
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('Student');
  const [inviteBatches, setInviteBatches] = useState<string[]>([]);
  const [inviteExpiresOn, setInviteExpiresOn] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Add these state variables
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSaveRoleChanges = async (userId: string, newRole: string, selectedBatchIds: string[]) => {
    try {
      // First update the role
      const roleUpdate = await updateUserRole(userId, newRole);
      
      // Then update the batches
      const batchUpdate = await updateUserBatches(userId, selectedBatchIds);

      // Update local state
      setUsers(users.map(user => {
        if (user._id === userId) {
          return {
            ...user,
            role: roleUpdate.role,
            batches: batchUpdate.batches
          };
        }
        return user;
      }));

      setShowRoleModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Add this function to handle invitations
  const handleInviteUsers = async () => {
    if (!inviteEmails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    setIsInviting(true);
    try {
      const result = await sendInvitation({
        emails: inviteEmails,
        role: inviteRole,
        batches: inviteBatches, // These are now batch IDs
        batchSubscriptions: inviteBatches.map(batchId => ({
          batch: batchId,
          expiresOn: inviteExpiresOn || undefined
        }))
      });

      // Show success message
      if (result.success.length > 0) {
        toast.success(`Successfully invited ${result.success.length} users`);
        setShowInviteModal(false);
        // Reset form
        setInviteEmails('');
        setInviteRole('Student');
        setInviteBatches([]);
        setInviteExpiresOn('');
      }
      if (result.already_exists.length > 0) {
        toast.warning(`${result.already_exists.length} users already exist`);
      }
      if (result.failed.length > 0) {
        toast.error(`Failed to invite ${result.failed.length} users`);
      }
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    } finally {
      setIsInviting(false);
    }
  };

  // Update the handleSendEmails function
  const handleSendEmails = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please fill in both subject and body');
      return;
    }
  
    setIsSendingEmail(true);
    try {
      const userIds = filteredUsers.map(user => user._id);
      const result = await sendBulkEmails({
        subject: emailSubject,
        body: emailBody,
        users: userIds
      });
  
      if (result.success.length > 0) {
        toast.success(`Successfully sent ${result.success.length} emails`);
      }
      if (result.failed.length > 0) {
        toast.error(`Failed to send ${result.failed.length} emails`);
      }
  
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedUsers = await fetchUsers({
          search: searchTerm,
          batch: selectedBatch,
          role: selectedRole
        });
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error loading users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [searchTerm, selectedBatch, selectedRole]);
  
  // Filter users based on search term, batch, and role
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedBatch !== 'All') {
      result = result.filter(user => 
        user.batches.some(batch => batch.name === selectedBatch)
      );
    }
    
    if (selectedRole !== 'All') {
      result = result.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, selectedBatch, selectedRole, users]);
  
  // Add this useEffect to load batches
  useEffect(() => {
    const loadBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const fetchedBatches = await fetchBatches();
        setBatches(fetchedBatches);
      } catch (error) {
        console.error('Error loading batches:', error);
        toast.error('Failed to load batches');
      } finally {
        setIsLoadingBatches(false);
      }
    };

    loadBatches();
  }, []);

  // Fix toast.warning calls by using toast with custom options
  const showWarning = (message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E'
      }
    });
  };

  // Update the batch handlers
  const handleAddBatch = async () => {
    if (!newBatchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    try {
      const newBatch = await createBatch({
        name: newBatchName.trim(),
        description: batchDescription.trim()
      });
      
      setBatches([...batches, newBatch]);
      setNewBatchName('');
      setBatchDescription('');
      toast.success('Batch created successfully');
    } catch (error: any) {
      console.error('Error creating batch:', error);
      toast.error(error.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleSaveEdit = async (batchId: string) => {
    if (!editBatchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    try {
      const updatedBatch = await updateBatch(batchId, {
        name: editBatchName.trim()
      });

      setBatches(batches.map(batch => 
        batch._id === batchId ? updatedBatch : batch
      ));
      handleCancelEdit(); // Reset edit state
      toast.success('Batch updated successfully');
    } catch (error: any) {
      console.error('Error updating batch:', error);
      toast.error(error.response?.data?.message || 'Failed to update batch');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      const result = await deleteBatch(batchId);
      
      if (result.deactivated) {
        // Update batch status in local state
        setBatches(batches.map(batch => 
          batch._id === batchId ? { ...batch, active: false } : batch
        ));
        showWarning('Batch has been deactivated as users are assigned to it');
      } else {
        // Remove batch from local state
        setBatches(batches.filter(batch => batch._id !== batchId));
        toast.success('Batch deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting batch:', error);
      toast.error(error.response?.data?.message || 'Failed to delete batch');
    }
  };

  const handleCancelEdit = () => {
    setEditBatchId(null);
    setEditBatchName('');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4">
        <h1 className="text-xl font-bold">LMS Admin Dashboard</h1>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* <aside className="w-64 bg-gray-100 p-4">
          <nav>
            <ul className="space-y-2">
              <li className="bg-blue-100 p-2 rounded font-medium">User Management</li>
              <li className="p-2 hover:bg-gray-200 rounded">Batch Management</li>
              <li className="p-2 hover:bg-gray-200 rounded">Content Library</li>
              <li className="p-2 hover:bg-gray-200 rounded">Analytics</li>
              <li className="p-2 hover:bg-gray-200 rounded">Settings</li>
            </ul>
          </nav>
        </aside>
         */}
        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex space-x-2">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus size={18} className="mr-2" />
                Invite User
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                onClick={() => setShowBatchModal(true)}
              >
                <Edit size={18} className="mr-2" />
                Manage Batches
              </button>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border rounded w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  {searchTerm && (
                    <button 
                      className="absolute right-3 top-3 text-gray-400"
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border rounded"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="All">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch._id} value={batch.name}>{batch.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500" />
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border rounded"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500" />
              </div>
              
              <div>
                <button 
                  className="bg-gray-200 px-4 py-2 rounded flex items-center"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBatch('All');
                    setSelectedRole('All');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Actions for selected users */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{filteredUsers.length}</span> users found
              </div>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <button 
                    className="bg-gray-200 px-4 py-2 rounded flex items-center"
                    // onClick={() => setShowExportDropdown(!showExportDropdown)}
                  >
                    <Download size={18} className="mr-2" />
                    Export
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  
                  {/* {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => handleExportFormat('csv')}
                        >
                          <Download size={16} className="mr-2" />
                          Export as CSV
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => handleExportFormat('xlsx')}
                        >
                          <Download size={16} className="mr-2" />
                          Export as Excels
                        </button>
                      </div>
                    </div>
                  )} */}
                </div>
                
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                  onClick={() => setShowEmailModal(true)}
                  disabled={filteredUsers.length === 0}
                >
                  <Mail size={18} className="mr-2" />
                  Send Email ({filteredUsers.length})
                </button>
              </div>
            </div>
          </div>
          
          {/* Users table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-center">Loading users...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">{error}</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Batches</th>
                    <th className="text-left py-3 px-4 font-medium">Join Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded ${
                          user.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'Mentor' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.batches.map(batch => batch.name).join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setSelectedBatches(user.batches.map(b => b._id));
                              setShowRoleModal(true);
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">
                        No users found. Try adjusting your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
      
     {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Invite New Member</h3>
                <button onClick={() => setShowInviteModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <textarea 
                    className="w-full border rounded p-2 h-24"
                    placeholder="Invite multiple people by separating email addresses with a comma."
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Role</label>
                  <select 
                    className="w-full border rounded p-2"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="Student">Student</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Batches</label>
                  <select 
                    className="w-full border rounded p-2" 
                    multiple 
                    size={4}
                    value={inviteBatches}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                      setInviteBatches(selected);
                    }}
                  >
                    {batches.map(batch => (
                      // Change this to use batch._id instead of batch.name
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Subscription Expires On:</label>
                  <input 
                    type="date" 
                    className="w-full border rounded p-2" 
                    value={inviteExpiresOn}
                    onChange={(e) => setInviteExpiresOn(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    User's subscription to the batch will get expired on the given day. 
                    Leaving empty will provide a lifetime access to this batch.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded w-full"
                  onClick={handleInviteUsers}
                  disabled={isInviting}
                >
                  {isInviting ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Manage Batches Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Manage Batches</h3>
                <button onClick={() => setShowBatchModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Create New Batch</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2 mb-2" 
                    placeholder="Enter batch name"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                  />
                  <textarea
                    className="w-full border rounded p-2"
                    placeholder="Enter batch description (optional)"
                    value={batchDescription}
                    onChange={(e) => setBatchDescription(e.target.value)}
                    rows={3}
                  />
                  <button 
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded w-full"
                    onClick={handleAddBatch}
                  >
                    Add Batch
                  </button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Existing Batches</h4>
                  {isLoadingBatches ? (
                    <div className="text-center py-4">Loading batches...</div>
                  ) : (
                    <div className="border rounded max-h-64 overflow-y-auto">
                      {batches.map(batch => (
                        <div key={batch._id} 
                          className={`p-3 border-b flex justify-between items-center ${
                            !batch.active ? 'bg-gray-100' : ''
                          }`}
                        >
                          {editBatchId === batch._id ? (
                            <div className="flex flex-1">
                              <input 
                                type="text" 
                                className="flex-1 border rounded-l p-2" 
                                value={editBatchName}
                                onChange={(e) => setEditBatchName(e.target.value)}
                              />
                              <button 
                                className="bg-green-600 text-white px-4 py-2"
                                onClick={() => handleSaveEdit(batch._id)}
                              >
                                Save
                              </button>
                              <button 
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-r"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className={!batch.active ? 'text-gray-500' : ''}>
                                  {batch.name}
                                </span>
                                {!batch.active && (
                                  <span className="ml-2 text-xs text-gray-500">(Inactive)</span>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => {
                                    setEditBatchId(batch._id);
                                    setEditBatchName(batch.name); // Set initial value to current batch name
                                  }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteBatch(batch._id)}
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {batches.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No batches found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Change User Role & Batches</h3>
                <button onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Role</label>
                  <select 
                    className="w-full border rounded p-2" 
                    defaultValue={selectedUser.role}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Assign to Batches</label>
                  <select 
                    className="w-full border rounded p-2" 
                    multiple 
                    size={4}
                    value={selectedBatches}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setSelectedBatches(selected);
                    }}
                  >
                    {batches.map(batch => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2">
                <button 
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded flex-1"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
                  onClick={() => handleSaveRoleChanges(
                    selectedUser._id,
                    newRole || selectedUser.role,
                    selectedBatches
                  )}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Send Email to Selected Users</h3>
                <button onClick={() => setShowEmailModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Message Body</label>
                  <textarea
                    className="w-full border rounded p-2 h-48"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Enter your message here..."
                  />
                </div>

                <div className="text-sm text-gray-600">
                  This email will be sent to {filteredUsers.length} selected users.
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2">
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded flex-1"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
                  onClick={handleSendEmails}
                  disabled={isSendingEmail || !emailSubject.trim() || !emailBody.trim()}
                >
                  {isSendingEmail ? 'Sending...' : 'Send Emails'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;