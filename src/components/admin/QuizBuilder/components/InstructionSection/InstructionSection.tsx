interface InstructionSectionProps {
  instructions: string[];
  newInstruction: string;
  onAddInstruction: (instruction: string) => void;
  onRemoveInstruction: (index: number) => void;
  onInstructionChange: (instruction: string) => void;
}

export const InstructionSection = ({
  instructions,
  newInstruction,
  onAddInstruction,
  onRemoveInstruction,
  onInstructionChange
}: InstructionSectionProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Instructions (Optional)
      </label>
      <div className="space-y-2">
        {instructions?.map((instruction, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm">{index + 1}.</span>
            <span className="flex-1">{instruction}</span>
            <button
              onClick={() => onRemoveInstruction(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={newInstruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder="Add an instruction..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onAddInstruction(newInstruction);
              }
            }}
          />
          <button
            onClick={() => onAddInstruction(newInstruction)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};