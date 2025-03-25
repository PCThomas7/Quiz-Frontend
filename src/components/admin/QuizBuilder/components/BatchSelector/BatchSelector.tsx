import React, { useState, useEffect } from 'react';
import { batchService } from '../../../../../services/batchService';
import { Batch } from '../../../../../types/types';

interface BatchSelectorProps {
  batchAssignment: string;
  selectedBatches: string[];
  onChange: (batchAssignment: string, selectedBatches: string[]) => void;
}

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  batchAssignment,
  selectedBatches,
  onChange
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching batches...'); // Add this log statement to see if the effect is running as expected
    const fetchBatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await batchService.getBatches();
        console.log('Fetched batches:', response);
        setBatches(response || []);
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError('Failed to load batches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const handleAssignmentTypeChange = (type: string) => {
    if (type === 'ALL' || type === 'NONE') {
      onChange(type, []);
    } else {
      onChange(type, selectedBatches);
    }
  };

  const handleBatchSelection = (batchId: string) => {
    const newSelection = selectedBatches.includes(batchId)
      ? selectedBatches.filter(id => id !== batchId)
      : [...selectedBatches, batchId];
    
    onChange('SPECIFIC', newSelection);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading batches...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Batch Assignment
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="batchAssignment"
              value="NONE"
              checked={batchAssignment === 'NONE'}
              onChange={() => handleAssignmentTypeChange('NONE')}
            />
            <span className="ml-2">None</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="batchAssignment"
              value="ALL"
              checked={batchAssignment === 'ALL'}
              onChange={() => handleAssignmentTypeChange('ALL')}
            />
            <span className="ml-2">All Batches</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="batchAssignment"
              value="SPECIFIC"
              checked={batchAssignment === 'SPECIFIC'}
              onChange={() => handleAssignmentTypeChange('SPECIFIC')}
            />
            <span className="ml-2">Specific Batches</span>
          </label>
        </div>
      </div>

      {batchAssignment === 'SPECIFIC' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Batches
          </label>
          {batches.length === 0 ? (
            <p className="text-sm text-gray-500">No batches available</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
              {batches.map(batch => (
                <label key={batch._id} className="inline-flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedBatches.includes(batch._id)}
                    onChange={() => handleBatchSelection(batch._id)}
                  />
                  <span className="ml-2">{batch.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};