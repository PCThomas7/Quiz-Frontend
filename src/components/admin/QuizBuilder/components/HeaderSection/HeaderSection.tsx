interface HeaderSectionProps {
  headerItems: string[];
  newHeader: string;
  onAddHeader: (header: string) => void;
  onRemoveHeader: (index: number) => void;
  onHeaderChange: (header: string) => void;
}

export const HeaderSection = ({
  headerItems,
  newHeader,
  onAddHeader,
  onRemoveHeader,
  onHeaderChange
}: HeaderSectionProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Header Notes (Optional)
      </label>
      <div className="space-y-2">
        {headerItems?.map((headerItem, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm">{index + 1}.</span>
            <span className="flex-1">{headerItem}</span>
            <button
              onClick={() => onRemoveHeader(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={newHeader}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="Add a header note..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onAddHeader(newHeader);
              }
            }}
          />
          <button
            onClick={() => onAddHeader(newHeader)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};