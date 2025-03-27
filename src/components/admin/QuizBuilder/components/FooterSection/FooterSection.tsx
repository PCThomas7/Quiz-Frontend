interface FooterSectionProps {
  footerItems: string[];
  newFooter: string;
  onAddFooter: (footer: string) => void;
  onRemoveFooter: (index: number) => void;
  onFooterChange: (footer: string) => void;
}

export const FooterSection = ({
  footerItems,
  newFooter,
  onAddFooter,
  onRemoveFooter,
  onFooterChange
}: FooterSectionProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Footer Notes (Optional)
      </label>
      <div className="space-y-2">
        {footerItems?.map((footerItem, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm">{index + 1}.</span>
            <span className="flex-1">{footerItem}</span>
            <button
              onClick={() => onRemoveFooter(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFooter}
            onChange={(e) => onFooterChange(e.target.value)}
            placeholder="Add a footer note..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onAddFooter(newFooter);
              }
            }}
          />
          <button
            onClick={() => onAddFooter(newFooter)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};